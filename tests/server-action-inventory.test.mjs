import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "serate-film-inventory-"));
process.env.DATABASE_PATH = path.join(tempRoot, "inventory.sqlite");
after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
const excludedSourceDirectories = new Set([
  ".git",
  ".next",
  "artifacts",
  "node_modules",
  "tests",
]);

function sourceFilesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && excludedSourceDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFilesUnder(absolute);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path.relative(projectRoot, absolute)] : [];
  });
}
function isExcludedSourcePath(file) {
  return file.split(/[\\/]/).some((part) => excludedSourceDirectories.has(part));
}
function scriptKindFor(file) {
  return file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}
function isServerActionSource(file, source) {
  const syntax = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKindFor(file));
  return syntax.statements.some((statement) =>
    ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression) &&
    statement.expression.text === "use server");
}
function serverActionFiles(sourceMap) {
  return [...sourceMap.entries()]
    .filter(([file, source]) => !isExcludedSourcePath(file) && isServerActionSource(file, source))
    .map(([file]) => file)
    .sort();
}
const projectSources = new Map(
  sourceFilesUnder(projectRoot)
    .map((file) => [file, fs.readFileSync(path.join(projectRoot, file), "utf8")])
);
const files = serverActionFiles(projectSources);
const sources = new Map(files.map((file) => [file, projectSources.get(file)]));
function parseTrees(sourceMap) {
  return new Map([...sourceMap.entries()].map(([file, source]) => [
    file,
    ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKindFor(file)),
  ]));
}
const syntaxTrees = parseTrees(projectSources);

const { EVENT_ACTION_AUTHORIZATION } = await import("../lib/access.ts");

function hasModifier(node, kind) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));
}

function exportedAsyncActions(file, trees = syntaxTrees) {
  const syntax = trees.get(file);
  const actions = [];
  for (const statement of syntax.statements) {
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly) {
      throw new Error(
        `${file} uses a value re-export; inventory discovery must explicitly resolve it`
      );
    }
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      statement.body &&
      hasModifier(statement, ts.SyntaxKind.ExportKeyword) &&
      hasModifier(statement, ts.SyntaxKind.AsyncKeyword)
    ) {
      actions.push({
        file,
        name: statement.name.text,
        body: statement.body,
        declaration: statement,
        parameters: statement.parameters,
        statement,
      });
      continue;
    }
    if (
      ts.isVariableStatement(statement) &&
      hasModifier(statement, ts.SyntaxKind.ExportKeyword)
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer)) &&
          hasModifier(declaration.initializer, ts.SyntaxKind.AsyncKeyword)
        ) {
          actions.push({
            file,
            name: declaration.name.text,
            body: declaration.initializer.body,
            declaration,
            parameters: declaration.initializer.parameters,
            statement,
          });
        }
      }
    }
  }
  return actions;
}

function inlineServerActions(file, trees) {
  const syntax = trees.get(file);
  const actions = [];
  const visit = (node) => {
    if (ts.isFunctionLike(node) && node.body && ts.isBlock(node.body) &&
        hasModifier(node, ts.SyntaxKind.AsyncKeyword)) {
      const first = node.body.statements[0];
      if (first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) &&
          first.expression.text === "use server") {
        let name = node.name && ts.isIdentifier(node.name) ? node.name.text : null;
        if (!name && ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
          name = node.parent.name.text;
        }
        if (!name && ts.isPropertyAssignment(node.parent)) name = propertyName(node.parent.name);
        actions.push({
          file,
          name: name ?? `<inline@${node.getStart()}>`,
          body: node.body,
          declaration: node,
          parameters: node.parameters,
          statement: node,
          inline: true,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  if (syntax) visit(syntax);
  return actions;
}

const policyHelpers = new Set([
  "authorizeEventAction",
  "authorizeEventInviteToken",
  "requireEventActionUser",
]);

function importedNames(file, moduleName, canonicalNames, trees = syntaxTrees) {
  const syntax = trees.get(file), result = new Map();
  if (!syntax) return result;
  for (const statement of syntax.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text !== moduleName) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || ts.isNamespaceImport(bindings)) continue;
    for (const specifier of bindings.elements) {
      const canonical = (specifier.propertyName || specifier.name).text;
      if (canonicalNames.has(canonical)) result.set(specifier.name.text, canonical);
    }
  }
  return result;
}

function importedPolicyBindings(file, trees = syntaxTrees) {
  const syntax = trees.get(file);
  const named = importedNames(file, "@/lib/access", policyHelpers, trees);
  const namespaces = new Set();
  for (const statement of syntax?.statements ?? []) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text !== "@/lib/access") continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
  }
  return { named, namespaces };
}

function bindingIdentifiers(name, result = []) {
  if (!name) return result;
  if (ts.isIdentifier(name)) {
    result.push(name);
    return result;
  }
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) bindingIdentifiers(element.name, result);
    }
  }
  return result;
}

function declaredBindingIdentifiers(body) {
  return visitBody(body, (node) =>
    ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node) ||
    ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) ||
    ts.isClassDeclaration(node) || ts.isClassExpression(node) || ts.isCatchClause(node))
    .flatMap((node) => {
      if (ts.isCatchClause(node)) {
        return bindingIdentifiers(node.variableDeclaration?.name);
      }
      return bindingIdentifiers(node.name);
    });
}

function unwrapExpression(node) {
  let current = node;
  while (current && (
    ts.isParenthesizedExpression(current) || ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) || ts.isNonNullExpression(current) ||
    (ts.isSatisfiesExpression && ts.isSatisfiesExpression(current))
  )) current = current.expression;
  return current;
}

const eventResourceIdentifiers = new Set([
  "attendance",
  "dateVotes",
  "eventContributions",
  "eventDates",
  "eventDiscussionMessages",
  "eventInvitees",
  "eventInviteLinks",
  "eventMovies",
  "eventNeeds",
  "eventRooms",
  "eventRsvps",
  "events",
  "movieBallotItems",
  "movieBallots",
  "movieVotes",
  "ratingComments",
  "ratings",
  "reviewLikes",
  "roomMessages",
  "roomParticipants",
  "roomPollOptions",
  "roomPolls",
  "roomPollVotes",
  "runoffVotes",
  "screeningLicenses",
]);

function isSchemaModuleSpecifier(specifier) {
  const normalized = specifier.replace(/\\/g, "/").replace(/\.(?:ts|tsx|js|jsx)$/, "");
  return normalized === "@/db/schema" || normalized === "db/schema" ||
    normalized.endsWith("/db/schema");
}

function resolveProjectModule(file, specifier, trees) {
  let base;
  if (specifier.startsWith("@/")) base = specifier.slice(2);
  else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  } else return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return candidates.find((candidate) => trees.has(candidate)) ?? null;
}

const forwardedEventExportCaches = new WeakMap();

function forwardedEventExports(file, trees, seen = new Set()) {
  if (!file || seen.has(file)) return new Set();
  let cache = forwardedEventExportCaches.get(trees);
  if (!cache) {
    cache = new Map();
    forwardedEventExportCaches.set(trees, cache);
  }
  const cacheable = seen.size === 0;
  if (cacheable && cache.has(file)) return new Set(cache.get(file));
  seen.add(file);
  const result = new Set();
  const syntax = trees.get(file);
  const localResources = new Set();
  const localNamespaces = new Map();
  const commonJsExportObjects = new Set(["exports"]);
  const moduleExecutionMatches = (predicate) => {
    const matches = [];
    const visit = (node) => {
      if (predicate(node)) matches.push(node);
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) return;
      if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
        for (const clause of node.heritageClauses ?? []) {
          for (const type of clause.types) visit(type.expression);
        }
        for (const member of node.members) {
          if (ts.isClassStaticBlockDeclaration(member)) visit(member.body);
          if (ts.isPropertyDeclaration(member) && member.initializer &&
              member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword)) {
            visit(member.initializer);
          }
          if (member.name && ts.isComputedPropertyName(member.name)) visit(member.name.expression);
        }
        return;
      }
      ts.forEachChild(node, visit);
    };
    if (syntax) visit(syntax);
    return matches;
  };
  const moduleVariables = (syntax?.statements ?? [])
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations]);
  const moduleFunctions = (syntax?.statements ?? []).filter(ts.isFunctionDeclaration);
  const moduleClasses = (syntax?.statements ?? []).filter(ts.isClassDeclaration);
  const moduleFunctionByName = new Map(moduleFunctions
    .filter((declaration) => declaration.name && declaration.body)
    .map((declaration) => [declaration.name.text, declaration]));
  for (const declaration of moduleVariables) {
    if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
    const initializer = unwrapExpression(declaration.initializer);
    if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
      moduleFunctionByName.set(declaration.name.text, initializer);
    }
  }
  const moduleBindingNames = new Set(moduleVariables
    .flatMap((declaration) => bindingIdentifiers(declaration.name).map((name) => name.text)));
  const assignmentOperators = new Set([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
  ]);
  const moduleAssignments = moduleExecutionMatches((node) =>
    ts.isBinaryExpression(node) && assignmentOperators.has(node.operatorToken.kind));
  const moduleCalls = moduleExecutionMatches(ts.isCallExpression);

  for (const statement of syntax?.statements ?? []) {
    if (ts.isImportEqualsDeclaration(statement) &&
        ts.isExternalModuleReference(statement.moduleReference) &&
        statement.moduleReference.expression &&
        ts.isStringLiteral(statement.moduleReference.expression)) {
      const specifier = statement.moduleReference.expression.text;
      const upstream = isSchemaModuleSpecifier(specifier)
        ? eventResourceIdentifiers
        : forwardedEventExports(resolveProjectModule(file, specifier, trees), trees, new Set(seen));
      if (upstream.size > 0) localNamespaces.set(statement.name.text, upstream);
      continue;
    }
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }
    const specifier = statement.moduleSpecifier.text;
    const upstream = isSchemaModuleSpecifier(specifier)
      ? eventResourceIdentifiers
      : forwardedEventExports(resolveProjectModule(file, specifier, trees), trees, new Set(seen));
    if (upstream.size === 0) continue;
    const clause = statement.importClause;
    if (!clause) continue;
    if (clause.name && (upstream.has("default") || upstream.has("*"))) {
      localResources.add(clause.name.text);
    }
    if (!clause.namedBindings) continue;
    if (ts.isNamespaceImport(clause.namedBindings)) {
      localNamespaces.set(clause.namedBindings.name.text, upstream);
      continue;
    }
    for (const element of clause.namedBindings.elements) {
      const imported = (element.propertyName || element.name).text;
      if (upstream.has(imported) || upstream.has("*")) localResources.add(element.name.text);
    }
  }

  const namespacePathIsEvent = (node) => {
    const segments = [];
    let current = unwrapExpression(node);
    while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
      const property = propertyName(current);
      if (!property) return false;
      segments.unshift(property);
      current = unwrapExpression(current.expression);
    }
    if (!ts.isIdentifier(current) || segments.length === 0) return false;
    const upstream = localNamespaces.get(current.text);
    return upstream ? upstream.has(segments[0]) || upstream.has("*") : false;
  };

  const directScopeBindings = (node) => {
    const names = new Set();
    const statements = ts.isSourceFile(node) || ts.isBlock(node) ? node.statements : [];
    for (const statement of statements) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          for (const name of bindingIdentifiers(declaration.name)) names.add(name.text);
        }
      } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
          statement.name) {
        names.add(statement.name.text);
      }
    }
    return names;
  };

  const containsKnownEvent = (expression) => {
    const visit = (node, shadowed) => {
      if (!node || ts.isTypeNode(node)) return false;
      if (ts.isFunctionLike(node)) {
        const nested = new Set(shadowed);
        if (node.name && ts.isIdentifier(node.name)) nested.add(node.name.text);
        for (const parameter of node.parameters ?? []) {
          for (const name of bindingIdentifiers(parameter.name)) nested.add(name.text);
        }
        if (!node.body) return false;
        return visit(node.body, nested);
      }
      if (ts.isBlock(node) || ts.isSourceFile(node)) {
        const nested = new Set(shadowed);
        for (const name of directScopeBindings(node)) nested.add(name);
        return node.statements.some((statement) => visit(statement, nested));
      }
      if (ts.isCatchClause(node)) {
        const nested = new Set(shadowed);
        for (const name of bindingIdentifiers(node.variableDeclaration?.name)) {
          nested.add(name.text);
        }
        return visit(node.block, nested);
      }
      const namespaceRoot = rootBindingName(node);
      if ((!namespaceRoot || !shadowed.has(namespaceRoot)) && namespacePathIsEvent(node)) {
        return true;
      }
      if (ts.isIdentifier(node) && localResources.has(node.text) && !shadowed.has(node.text)) {
        const parent = node.parent;
        const isPropertyLabel =
          (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
          ((ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent) ||
            ts.isPropertyDeclaration(parent)) && parent.name === node);
        if (!isPropertyLabel) return true;
      }
      let found = false;
      ts.forEachChild(node, (child) => {
        if (!found && visit(child, shadowed)) found = true;
      });
      return found;
    };
    return visit(expression, new Set());
  };

  const rootBindingName = (expression) => {
    let current = unwrapExpression(expression);
    while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
      current = unwrapExpression(current.expression);
    }
    return ts.isIdentifier(current) ? current.text : null;
  };

  const assignmentBindingNames = (expression, names = new Set()) => {
    const target = unwrapExpression(expression);
    if (ts.isIdentifier(target)) {
      names.add(target.text);
    } else if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) {
      const root = rootBindingName(target);
      if (root) names.add(root);
    } else if (ts.isObjectLiteralExpression(target)) {
      for (const property of target.properties) {
        if (ts.isShorthandPropertyAssignment(property)) names.add(property.name.text);
        else if (ts.isPropertyAssignment(property)) {
          assignmentBindingNames(property.initializer, names);
        } else if (ts.isSpreadAssignment(property)) {
          assignmentBindingNames(property.expression, names);
        }
      }
    } else if (ts.isArrayLiteralExpression(target)) {
      for (const element of target.elements) assignmentBindingNames(element, names);
    } else if (ts.isBinaryExpression(target) &&
        target.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      assignmentBindingNames(target.left, names);
    }
    return names;
  };

  let aliasesChanged = true;
  while (aliasesChanged) {
    aliasesChanged = false;
    for (const declaration of moduleVariables) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer ||
          localResources.has(declaration.name.text)) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (ts.isIdentifier(initializer) && commonJsExportObjects.has(initializer.text)) {
        commonJsExportObjects.add(declaration.name.text);
      }
      if ((ts.isPropertyAccessExpression(initializer) ||
          ts.isElementAccessExpression(initializer)) &&
          ts.isIdentifier(unwrapExpression(initializer.expression)) &&
          unwrapExpression(initializer.expression).text === "module" &&
          propertyName(initializer) === "exports") {
        commonJsExportObjects.add(declaration.name.text);
      }
      if (containsKnownEvent(initializer)) {
        localResources.add(declaration.name.text);
        aliasesChanged = true;
      }
    }
    for (const declaration of moduleFunctions) {
      if (!declaration.name || !declaration.body ||
          localResources.has(declaration.name.text)) continue;
      if (containsKnownEvent(declaration.body)) {
        localResources.add(declaration.name.text);
        aliasesChanged = true;
      }
    }
    for (const declaration of moduleClasses) {
      if (!declaration.name || localResources.has(declaration.name.text)) continue;
      if (containsKnownEvent(declaration)) {
        localResources.add(declaration.name.text);
        aliasesChanged = true;
      }
    }
    for (const assignment of moduleAssignments) {
      if (!containsKnownEvent(assignment.right) && !containsKnownEvent(assignment.left)) continue;
      for (const binding of assignmentBindingNames(assignment.left)) {
        if (binding !== "module" && !commonJsExportObjects.has(binding) &&
            !localResources.has(binding)) {
          localResources.add(binding);
          aliasesChanged = true;
        }
      }
    }
    for (const call of moduleCalls) {
      if (!containsKnownEvent(call) || call.arguments.length === 0) continue;
      const binding = rootBindingName(call.arguments[0]);
      if (binding && binding !== "module" && !commonJsExportObjects.has(binding) &&
          !localResources.has(binding)) {
        localResources.add(binding);
        aliasesChanged = true;
      }
      const callee = unwrapExpression(call.expression);
      const declaration = ts.isIdentifier(callee) ? moduleFunctionByName.get(callee.text) : null;
      if (!declaration?.body) continue;
      const tainted = new Set();
      declaration.parameters.forEach((parameter, index) => {
        if (call.arguments[index] && containsKnownEvent(call.arguments[index])) {
          for (const name of bindingIdentifiers(parameter.name)) tainted.add(name.text);
        }
      });
      if (tainted.size === 0) continue;
      const localBindings = new Set(declaration.parameters
        .flatMap((parameter) => bindingIdentifiers(parameter.name).map((name) => name.text)));
      const assignments = [];
      const collect = (node) => {
        if (node !== declaration.body && (ts.isFunctionLike(node) ||
            ts.isClassDeclaration(node) || ts.isClassExpression(node))) return;
        if (ts.isVariableDeclaration(node)) {
          for (const name of bindingIdentifiers(node.name)) localBindings.add(name.text);
        }
        if (ts.isBinaryExpression(node) && assignmentOperators.has(node.operatorToken.kind)) {
          assignments.push(node);
        }
        ts.forEachChild(node, collect);
      };
      collect(declaration.body);
      let functionChanged = true;
      while (functionChanged) {
        functionChanged = false;
        for (const assignment of assignments) {
          const carriesArgument = visitBody(assignment.right, (node) =>
            ts.isIdentifier(node) && tainted.has(node.text)).length > 0;
          if (!carriesArgument && !containsKnownEvent(assignment.right)) continue;
          for (const target of assignmentBindingNames(assignment.left)) {
            if (localBindings.has(target) && !tainted.has(target)) {
              tainted.add(target);
              functionChanged = true;
            } else if (moduleBindingNames.has(target) && !localResources.has(target)) {
              localResources.add(target);
              aliasesChanged = true;
            }
          }
        }
      }
    }
  }

  const expressionUsesLocalEvent = containsKnownEvent;

  const commonJsExportName = (node) => {
    const target = unwrapExpression(node);
    if (!(ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target))) {
      return null;
    }
    const owner = unwrapExpression(target.expression);
    const member = propertyName(target);
    if (!member || !owner) return null;
    if (ts.isIdentifier(owner) && commonJsExportObjects.has(owner.text)) return member;
    if (ts.isIdentifier(owner) && owner.text === "module" && member === "exports") {
      return "default";
    }
    if (ts.isPropertyAccessExpression(owner) || ts.isElementAccessExpression(owner)) {
      const root = unwrapExpression(owner.expression);
      if (ts.isIdentifier(root) && root.text === "module" && propertyName(owner) === "exports") {
        return member;
      }
    }
    return null;
  };

  const isCommonJsExportObject = (node) => {
    const target = unwrapExpression(node);
    if (ts.isIdentifier(target)) return commonJsExportObjects.has(target.text);
    return Boolean(
      (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) &&
      ts.isIdentifier(unwrapExpression(target.expression)) &&
      unwrapExpression(target.expression).text === "module" &&
      propertyName(target) === "exports"
    );
  };

  const recordCommonJsObject = (expression) => {
    const object = unwrapExpression(expression);
    if (!ts.isObjectLiteralExpression(object)) {
      if (expressionUsesLocalEvent(object)) result.add("*");
      return;
    }
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property)) {
        if (expressionUsesLocalEvent(property.expression)) result.add("*");
        continue;
      }
      if (ts.isShorthandPropertyAssignment(property)) {
        if (localResources.has(property.name.text)) result.add(property.name.text);
        continue;
      }
      if (!ts.isPropertyAssignment(property) ||
          !expressionUsesLocalEvent(property.initializer)) continue;
      const name = propertyName(property);
      result.add(name ?? "*");
    }
  };

  for (const statement of syntax?.statements ?? []) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) ?? [] : [];
    const isExportedDeclaration = modifiers.some((modifier) =>
      modifier.kind === ts.SyntaxKind.ExportKeyword);
    const isDefaultDeclaration = modifiers.some((modifier) =>
      modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (isExportedDeclaration &&
        (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))) {
      if (containsKnownEvent(statement)) {
        if (isDefaultDeclaration) result.add("default");
        else if (statement.name) result.add(statement.name.text);
        else result.add("*");
      }
      continue;
    }
    if (isExportedDeclaration && ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!declaration.initializer || !containsKnownEvent(declaration.initializer)) continue;
        const names = bindingIdentifiers(declaration.name);
        if (isDefaultDeclaration) result.add("default");
        else if (names.length === 0) result.add("*");
        else for (const name of names) result.add(name.text);
      }
      continue;
    }
    if (ts.isExpressionStatement(statement) && ts.isCallExpression(statement.expression)) {
      const call = statement.expression;
      const callee = unwrapExpression(call.expression);
      const owner = (ts.isPropertyAccessExpression(callee) ||
        ts.isElementAccessExpression(callee)) ? unwrapExpression(callee.expression) : null;
      const method = (ts.isPropertyAccessExpression(callee) ||
        ts.isElementAccessExpression(callee)) ? propertyName(callee) : null;
      // Any top-level call receiving both the CommonJS export object and an event
      // resource can publish that resource, even through an aliased helper/API.
      // Record wildcard provenance rather than trying to enumerate every Node API.
      if (visitBody(call, isCommonJsExportObject).length > 0 &&
          expressionUsesLocalEvent(call)) {
        result.add("*");
        continue;
      }
      if (owner && ts.isIdentifier(owner) && owner.text === "Object" && method === "assign" &&
          call.arguments.length >= 2 && isCommonJsExportObject(call.arguments[0])) {
        for (const source of call.arguments.slice(1)) recordCommonJsObject(source);
        continue;
      }
      if (owner && ts.isIdentifier(owner) &&
          (owner.text === "Object" || owner.text === "Reflect") &&
          method === "defineProperty" && call.arguments.length >= 3 &&
          isCommonJsExportObject(call.arguments[0])) {
        const name = staticStringValue(call.arguments[1]);
        const descriptor = unwrapExpression(call.arguments[2]);
        if (ts.isObjectLiteralExpression(descriptor)) {
          const valueProperty = descriptor.properties.find((property) =>
            ts.isPropertyAssignment(property) && propertyName(property) === "value");
          if (valueProperty && ts.isPropertyAssignment(valueProperty) &&
              expressionUsesLocalEvent(valueProperty.initializer)) {
            result.add(name ?? "*");
          }
        } else if (expressionUsesLocalEvent(descriptor)) {
          result.add(name ?? "*");
        }
        continue;
      }
    }
    if (ts.isExpressionStatement(statement) && ts.isBinaryExpression(statement.expression) &&
        statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const exported = commonJsExportName(statement.expression.left);
      if (exported && expressionUsesLocalEvent(statement.expression.right)) result.add(exported);
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      if (expressionUsesLocalEvent(statement.expression) ||
          (ts.isIdentifier(statement.expression) &&
            localNamespaces.has(statement.expression.text))) {
        result.add("default");
      }
      continue;
    }
    if (!ts.isExportDeclaration(statement)) continue;
    if (!statement.moduleSpecifier) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          const local = (element.propertyName || element.name).text;
          if (localResources.has(local) || localNamespaces.has(local)) {
            result.add(element.name.text);
          }
        }
      }
      continue;
    }
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const direct = isSchemaModuleSpecifier(specifier);
    const target = direct ? null : resolveProjectModule(file, specifier, trees);
    const upstream = direct
      ? eventResourceIdentifiers
      : forwardedEventExports(target, trees, new Set(seen));
    if (upstream.size === 0) continue;
    if (!statement.exportClause) {
      for (const name of upstream) result.add(name);
      continue;
    }
    if (ts.isNamespaceExport(statement.exportClause)) {
      result.add(statement.exportClause.name.text);
      continue;
    }
    for (const element of statement.exportClause.elements) {
      const imported = (element.propertyName || element.name).text;
      if (upstream.has(imported) || upstream.has("*")) result.add(element.name.text);
    }
  }
  if (cacheable) cache.set(file, new Set(result));
  return result;
}

function localEventResourceNames(file, trees = syntaxTrees) {
  const syntax = trees.get(file), names = new Set();
  for (const statement of syntax?.statements ?? []) {
    if (ts.isImportEqualsDeclaration(statement) &&
        ts.isExternalModuleReference(statement.moduleReference) &&
        statement.moduleReference.expression &&
        ts.isStringLiteral(statement.moduleReference.expression) &&
        (isSchemaModuleSpecifier(statement.moduleReference.expression.text) ||
          forwardedEventExports(
            resolveProjectModule(file, statement.moduleReference.expression.text, trees),
            trees
          ).size > 0)) {
      names.add(`${statement.name.text}.*`);
      names.add(statement.name.text);
      continue;
    }
    if (!ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const moduleName = statement.moduleSpecifier.text;
    const directSchema = isSchemaModuleSpecifier(moduleName);
    const forwarded = directSchema
      ? eventResourceIdentifiers
      : forwardedEventExports(resolveProjectModule(file, moduleName, trees), trees);
    if (forwarded.size === 0) continue;
    const clause = statement.importClause;
    if (!clause) continue;
    if (clause.name && (forwarded.has("default") || forwarded.has("*"))) {
      names.add(clause.name.text);
    }
    if (!clause.namedBindings) continue;
    if (ts.isNamespaceImport(clause.namedBindings)) {
      names.add(`${clause.namedBindings.name.text}.*`);
      names.add(clause.namedBindings.name.text);
      continue;
    }
    for (const specifier of clause.namedBindings.elements) {
      const canonical = (specifier.propertyName || specifier.name).text;
      if (forwarded.has(canonical) || forwarded.has("*")) names.add(specifier.name.text);
    }
  }
  return names;
}

function staticStringValue(node) {
  const expression = unwrapExpression(node);
  if (!expression) return null;
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticStringValue(expression.left);
    const right = staticStringValue(expression.right);
    return left === null || right === null ? null : left + right;
  }
  return null;
}

const moduleLoaderAliasCaches = new WeakMap();

function moduleLoaderAliases(file, trees) {
  let cache = moduleLoaderAliasCaches.get(trees);
  if (!cache) {
    cache = new Map();
    moduleLoaderAliasCaches.set(trees, cache);
  }
  if (cache.has(file)) return cache.get(file);
  const aliases = new Set(["require"]);
  const syntax = trees.get(file);
  let changed = true;
  while (changed) {
    changed = false;
    for (const declaration of visitBody(syntax, ts.isVariableDeclaration)) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer ||
          aliases.has(declaration.name.text)) continue;
      const initializer = unwrapExpression(declaration.initializer);
      if (ts.isIdentifier(initializer) && aliases.has(initializer.text)) {
        aliases.add(declaration.name.text);
        changed = true;
      }
      if (ts.isCallExpression(initializer)) {
        const callee = unwrapExpression(initializer.expression);
        if ((ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) &&
            propertyName(callee) === "bind") {
          const target = unwrapExpression(callee.expression);
          if (ts.isIdentifier(target) && aliases.has(target.text)) {
            aliases.add(declaration.name.text);
            changed = true;
          }
        }
      }
    }
  }
  cache.set(file, aliases);
  return aliases;
}

function moduleLoaderSpecifier(node, file, trees) {
  if (!ts.isCallExpression(node) || node.arguments.length !== 1) return undefined;
  const isImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
  const isRequire = ts.isIdentifier(node.expression) &&
    moduleLoaderAliases(file, trees).has(node.expression.text);
  if (!isImport && !isRequire) return undefined;
  return staticStringValue(node.arguments[0]);
}

function schemaLoaderRisk(node, file, trees = syntaxTrees) {
  const specifier = moduleLoaderSpecifier(node, file, trees);
  if (specifier === undefined) return false;
  if (specifier === null || isSchemaModuleSpecifier(specifier)) return true;
  return forwardedEventExports(resolveProjectModule(file, specifier, trees), trees).size > 0;
}

function actionAliases(declaration, trees = syntaxTrees) {
  const imported = localEventResourceNames(declaration.file, trees);
  const resources = new Set([...imported].filter((name) => !name.endsWith(".*")));
  const namespaces = new Set(
    [...imported].filter((name) => name.endsWith(".*")).map((name) => name.slice(0, -2))
  );
  const databases = new Set(["db", "tx"]);
  const queries = new Set();
  const forbidden = [];
  const declarations = visitBody(declaration.body, ts.isVariableDeclaration);
  let changed = true;
  while (changed) {
    changed = false;
    for (const variable of declarations) {
      const initializer = unwrapExpression(variable.initializer);
      if (!initializer) continue;
      if (ts.isIdentifier(variable.name) && ts.isIdentifier(initializer)) {
        const target = variable.name.text;
        if (resources.has(initializer.text) && !resources.has(target)) {
          resources.add(target); forbidden.push(variable); changed = true;
        }
        if (namespaces.has(initializer.text) && !namespaces.has(target)) {
          namespaces.add(target); forbidden.push(variable); changed = true;
        }
        if (databases.has(initializer.text) && !databases.has(target)) {
          databases.add(target); forbidden.push(variable); changed = true;
        }
        if (queries.has(initializer.text) && !queries.has(target)) {
          queries.add(target); forbidden.push(variable); changed = true;
        }
      }
      if (
        ts.isIdentifier(variable.name) &&
        (ts.isPropertyAccessExpression(initializer) || ts.isElementAccessExpression(initializer))
      ) {
        const ownerExpression = unwrapExpression(initializer.expression);
        const owner = ts.isIdentifier(ownerExpression) ? ownerExpression.text : null;
        const member = propertyName(initializer);
        if (owner && namespaces.has(owner) && member && eventResourceIdentifiers.has(member) &&
            !resources.has(variable.name.text)) {
          resources.add(variable.name.text); forbidden.push(variable); changed = true;
        }
        if (owner && databases.has(owner)) {
          forbidden.push(variable);
          if (member === "query" && !queries.has(variable.name.text)) {
            queries.add(variable.name.text); changed = true;
          }
        }
      }
      if (ts.isIdentifier(variable.name) && ts.isObjectLiteralExpression(initializer)) {
        const spreadsNamespace = initializer.properties.some((property) =>
          ts.isSpreadAssignment(property) &&
          isDatabaseIdentifier(property.expression, namespaces));
        const spreadsDatabase = initializer.properties.some((property) =>
          ts.isSpreadAssignment(property) &&
          isDatabaseIdentifier(property.expression, databases));
        if (spreadsNamespace && !namespaces.has(variable.name.text)) {
          namespaces.add(variable.name.text); forbidden.push(variable); changed = true;
        }
        if (spreadsDatabase && !databases.has(variable.name.text)) {
          databases.add(variable.name.text); forbidden.push(variable); changed = true;
        }
      }
      if (ts.isObjectBindingPattern(variable.name) && ts.isIdentifier(initializer) &&
          namespaces.has(initializer.text)) {
        for (const element of variable.name.elements) {
          const boundNames = bindingIdentifiers(element.name);
          if (element.dotDotDotToken) {
            for (const bound of boundNames) {
              if (!namespaces.has(bound.text)) {
                namespaces.add(bound.text); forbidden.push(variable); changed = true;
              }
            }
            continue;
          }
          if (!ts.isIdentifier(element.name)) continue;
          const canonical = element.propertyName && ts.isIdentifier(element.propertyName)
            ? element.propertyName.text
            : element.name.text;
          if (eventResourceIdentifiers.has(canonical) && !resources.has(element.name.text)) {
            resources.add(element.name.text); forbidden.push(variable); changed = true;
          }
        }
      }
      if (ts.isObjectBindingPattern(variable.name) && ts.isIdentifier(initializer) &&
          databases.has(initializer.text)) {
        for (const element of variable.name.elements) {
          const boundNames = bindingIdentifiers(element.name);
          const canonical = element.propertyName && ts.isIdentifier(element.propertyName)
            ? element.propertyName.text
            : ts.isIdentifier(element.name) ? element.name.text : null;
          for (const bound of boundNames) {
            if (element.dotDotDotToken && !databases.has(bound.text)) {
              databases.add(bound.text); changed = true;
            }
            if (canonical === "query" && !queries.has(bound.text)) {
              queries.add(bound.text); changed = true;
            }
          }
          forbidden.push(variable);
        }
      }
      if (ts.isObjectBindingPattern(variable.name) &&
          isQueryObjectExpression(initializer, databases, queries)) {
        for (const element of variable.name.elements) {
          const boundNames = bindingIdentifiers(element.name);
          const canonical = element.propertyName && ts.isIdentifier(element.propertyName)
            ? element.propertyName.text
            : ts.isIdentifier(element.name) ? element.name.text : null;
          for (const bound of boundNames) {
            if (element.dotDotDotToken && !queries.has(bound.text)) {
              queries.add(bound.text); changed = true;
            }
            if (canonical && eventResourceIdentifiers.has(canonical) &&
                !resources.has(bound.text)) {
              resources.add(bound.text); changed = true;
            }
          }
          forbidden.push(variable);
        }
      }
    }
  }
  return { resources, namespaces, databases, queries, forbidden: [...new Set(forbidden)] };
}

// deleteUser is a global account-administration action. It cleans up event rows,
// but has no target event or event-state capability to inventory; audit it as the
// one explicit cross-cutting maintenance exception instead of hiding it by position.
const eventResourceMaintenanceExceptions = new Set(["deleteUser"]);

const topLevelDeclarations = files.flatMap((file) => exportedAsyncActions(file));
const topLevelBodies = new Set(topLevelDeclarations.map((action) => action.body));
const inlineDeclarations = [...projectSources.keys()]
  .filter((file) => file.startsWith("app/") || file.startsWith("lib/"))
  .flatMap((file) => inlineServerActions(file, syntaxTrees))
  .filter((action) => !topLevelBodies.has(action.body));
const declarations = [...topLevelDeclarations, ...inlineDeclarations];

function visitBody(body, predicate) {
  const matches = [];
  const visit = (node) => {
    if (predicate(node)) matches.push(node);
    ts.forEachChild(node, visit);
  };
  visit(body);
  return matches;
}

function namedPolicyHooks(declaration, trees = syntaxTrees) {
  const bindings = importedPolicyBindings(declaration.file, trees);
  return visitBody(
    declaration.body,
    (node) => {
      if (!ts.isCallExpression(node) || node.arguments.length === 0 ||
          !ts.isStringLiteral(node.arguments[0]) ||
          node.arguments[0].text !== declaration.name) return false;
      if (ts.isIdentifier(node.expression)) return bindings.named.has(node.expression.text);
      if ((ts.isPropertyAccessExpression(node.expression) ||
          ts.isElementAccessExpression(node.expression)) &&
          ts.isIdentifier(node.expression.expression)) {
        return bindings.namespaces.has(node.expression.expression.text) &&
          policyHelpers.has(propertyName(node.expression));
      }
      return false;
    }
  );
}

function propertyName(node) {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node)) {
    return staticStringValue(node.argumentExpression);
  }
  if ((ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node) ||
      ts.isPropertyDeclaration(node)) && node.name) {
    if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ||
        ts.isNumericLiteral(node.name)) return node.name.text;
    if (ts.isComputedPropertyName(node.name)) return staticStringValue(node.name.expression);
  }
  return null;
}

function isDatabaseIdentifier(node, databaseNames) {
  const expression = unwrapExpression(node);
  return Boolean(expression && ts.isIdentifier(expression) && databaseNames.has(expression.text));
}

function isQueryObjectExpression(node, databaseNames, queryNames) {
  const expression = unwrapExpression(node);
  if (!expression) return false;
  if (ts.isIdentifier(expression)) return queryNames.has(expression.text);
  return (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) &&
    propertyName(expression) === "query" &&
    isDatabaseIdentifier(expression.expression, databaseNames);
}

function isDbQueryEventAccess(node, aliases) {
  if (!(ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) ||
      !eventResourceIdentifiers.has(propertyName(node))) return false;
  const query = unwrapExpression(node.expression);
  return isQueryObjectExpression(query, aliases.databases, aliases.queries);
}

function touchedEventResources(declaration, trees = syntaxTrees) {
  const aliases = actionAliases(declaration, trees);
  return new Set(
    visitBody(
      declaration.body,
      (node) =>
        (ts.isIdentifier(node) && aliases.resources.has(node.text)) ||
        ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
          isDatabaseIdentifier(node.expression, aliases.namespaces) &&
          eventResourceIdentifiers.has(propertyName(node))) ||
        isDbQueryEventAccess(node, aliases) ||
        schemaLoaderRisk(node, declaration.file, trees)
    ).map((node) => {
      if (schemaLoaderRisk(node, declaration.file, trees)) return "loader:event-schema";
      if (isDbQueryEventAccess(node, aliases)) return `query:${propertyName(node)}`;
      return ts.isIdentifier(node) ? node.text : propertyName(node);
    })
  );
}

function databaseMutations(declaration, trees = syntaxTrees) {
  const databaseNames = actionAliases(declaration, trees).databases;
  return visitBody(declaration.body, (node) => {
    if (!ts.isCallExpression(node) ||
        !(ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression))) {
      return false;
    }
    const receiver = unwrapExpression(node.expression.expression);
    const method = propertyName(node.expression);
    return (
      ts.isIdentifier(receiver) &&
      databaseNames.has(receiver.text) &&
      ["delete", "insert", "transaction", "update"].includes(method)
    );
  });
}

function databaseMutationCapabilities(declaration, trees = syntaxTrees) {
  const databaseNames = actionAliases(declaration, trees).databases;
  return visitBody(declaration.body, (node) => {
    if (!(ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) return false;
    return isDatabaseIdentifier(node.expression, databaseNames) &&
      ["delete", "insert", "transaction", "update"].includes(propertyName(node));
  });
}

function directTopLevelStatement(body, node) {
  let current = node;
  while (current.parent && !ts.isStatement(current)) current = current.parent;
  return current.parent === body ? current : null;
}

function canonicalAwaitedPolicyStatement(declaration, hook) {
  const awaited = hook.parent;
  if (!awaited || !ts.isAwaitExpression(awaited) || awaited.expression !== hook) return null;
  const owner = awaited.parent;
  if (ts.isExpressionStatement(owner) && owner.expression === awaited &&
      owner.parent === declaration.body) {
    return owner;
  }
  if (ts.isVariableDeclaration(owner) && owner.initializer === awaited &&
      ts.isVariableDeclarationList(owner.parent) && owner.parent.declarations.length === 1 &&
      ts.isVariableStatement(owner.parent.parent) && owner.parent.parent.parent === declaration.body) {
    return owner.parent.parent;
  }
  return null;
}

function auditActionShape(declaration, trees = syntaxTrees) {
  const errors = [];
  const hooks = namedPolicyHooks(declaration, trees);
  if (hooks.length !== 1) errors.push("exactly one named policy hook required");
  const hook = hooks[0];
  const hookStatement = hook && canonicalAwaitedPolicyStatement(declaration, hook);
  if (!hookStatement) {
    errors.push("policy hook must be a direct awaited top-level statement without wrappers");
  }
  const mutations = databaseMutations(declaration, trees);
  if (hookStatement && mutations.length &&
      hookStatement.getStart() >= Math.min(...mutations.map((item) => item.getStart()))) {
    errors.push("policy hook must precede first database mutation");
  }
  const aliases = actionAliases(declaration, trees);
  if (aliases.forbidden.length) {
    errors.push("event-resource, schema, and database aliases are forbidden in Server Actions");
  }
  const dynamicDb = visitBody(declaration.body, (node) =>
    ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) &&
    (node.expression.text === "db" || node.expression.text === "tx") &&
    !ts.isStringLiteral(node.argumentExpression));
  if (dynamicDb.length) errors.push("dynamic database method access is forbidden");
  if (visitBody(
    declaration.body,
    (node) => schemaLoaderRisk(node, declaration.file, trees)
  ).length) {
    errors.push("dynamic, computed, or require schema imports are forbidden in Server Actions");
  }
  const policyBindings = importedPolicyBindings(declaration.file, trees);
  const importedPolicyNames = new Set([
    ...policyBindings.named.keys(),
    ...policyBindings.namespaces,
  ]);
  const actionParameterBindings = (declaration.parameters ?? [])
    .flatMap((parameter) => bindingIdentifiers(parameter.name));
  const shadows = [...actionParameterBindings, ...declaredBindingIdentifiers(declaration.body)]
    .filter((identifier) => importedPolicyNames.has(identifier.text));
  if (shadows.length) errors.push("imported policy helper bindings may not be shadowed");
  return errors;
}

function moduleLevelExecutableContainers(file, trees = syntaxTrees) {
  const syntax = trees.get(file);
  const actions = exportedAsyncActions(file, trees);
  const actionDeclarations = new Set(actions.map((action) => action.declaration));
  const actionStatements = new Set(actions.map((action) => action.statement));
  const containers = [];
  for (const statement of syntax?.statements ?? []) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (actionDeclarations.has(declaration)) continue;
        const label = ts.isIdentifier(declaration.name)
          ? declaration.name.text
          : "VariableDeclaration";
        containers.push({ file, name: label, body: declaration });
      }
      continue;
    }
    if (actionStatements.has(statement) || ts.isImportDeclaration(statement) ||
        ts.isExportDeclaration(statement) || ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression))) {
      continue;
    }
    const label = statement.name && ts.isIdentifier(statement.name)
      ? statement.name.text
      : ts.SyntaxKind[statement.kind];
    containers.push({ file, name: label, body: statement });
  }
  return containers;
}

function projectActionDeclarations(sourceMap, trees) {
  const topLevel = serverActionFiles(sourceMap)
    .flatMap((file) => exportedAsyncActions(file, trees));
  const bodies = new Set(topLevel.map((action) => action.body));
  const inline = [...sourceMap.keys()]
    .filter((file) => file.startsWith("app/") || file.startsWith("lib/"))
    .flatMap((file) => inlineServerActions(file, trees))
    .filter((action) => !bodies.has(action.body));
  return [...topLevel, ...inline];
}

function executableRegions(file, trees) {
  const syntax = trees.get(file);
  const regions = [];
  const seen = new Set();
  const add = (name, body) => {
    if (!body || seen.has(body)) return;
    seen.add(body);
    regions.push({ file, name, body });
  };
  const visit = (node) => {
    if (ts.isFunctionLike(node) && node.body) {
      const name = node.name && ts.isIdentifier(node.name)
        ? node.name.text
        : `<function@${node.getStart()}>`;
      add(name, node.body);
    }
    if ((ts.isPropertyDeclaration(node) || ts.isPropertyAssignment(node)) && node.initializer &&
        !ts.isArrowFunction(node.initializer) && !ts.isFunctionExpression(node.initializer)) {
      add(`<initializer@${node.getStart()}>`, node.initializer);
    }
    if (ts.isVariableDeclaration(node) && node.initializer &&
        ts.isVariableDeclarationList(node.parent) &&
        ts.isVariableStatement(node.parent.parent) && ts.isSourceFile(node.parent.parent.parent) &&
        !ts.isArrowFunction(node.initializer) && !ts.isFunctionExpression(node.initializer)) {
      const name = ts.isIdentifier(node.name) ? node.name.text : `<variable@${node.getStart()}>`;
      add(name, node.initializer);
    }
    if (ts.isExpressionStatement(node) && ts.isSourceFile(node.parent) &&
        !ts.isStringLiteral(node.expression) &&
        visitBody(node.expression, ts.isFunctionLike).length === 0) {
      add(`<module-expression@${node.getStart()}>`, node.expression);
    }
    if (ts.isExportAssignment(node)) add(`<export@${node.getStart()}>`, node.expression);
    if (ts.isClassStaticBlockDeclaration(node)) add(`<static@${node.getStart()}>`, node.body);
    ts.forEachChild(node, visit);
  };
  if (syntax) visit(syntax);
  return regions;
}

function forbiddenProjectEventMutationRegions(sourceMap) {
  const trees = parseTrees(sourceMap);
  const actions = projectActionDeclarations(sourceMap, trees);
  const allowedBodies = new Set(actions.map((action) => action.body));
  const isInsideAllowedAction = (node) => {
    let current = node;
    while (current) {
      if (allowedBodies.has(current)) return true;
      current = current.parent;
    }
    return false;
  };
  const violations = [];
  for (const file of sourceMap.keys()) {
    const outsideRegions = executableRegions(file, trees)
      .filter((region) => !isInsideAllowedAction(region.body));
    const fileViolations = [];
    for (const region of outsideRegions) {
      if (touchedEventResources(region, trees).size > 0 &&
          (databaseMutations(region, trees).length > 0 ||
            databaseMutationCapabilities(region, trees).length > 0)) {
        fileViolations.push(`${file}:${region.name}`);
      }
    }
    violations.push(...fileViolations);
    if (fileViolations.length === 0 &&
        outsideRegions.some((region) => touchedEventResources(region, trees).size > 0) &&
        outsideRegions.some((region) =>
          databaseMutations(region, trees).length > 0 ||
          databaseMutationCapabilities(region, trees).length > 0)) {
      violations.push(`${file}:<split-event-capability>`);
    }
  }
  return violations.sort();
}

test("Server Action discovery includes app modules and excludes generated or test trees", () => {
  const sourceMap = new Map([
    ["lib/actions.ts", `"use server"; export async function fromLib(){}`],
    ["app/admin/actions.ts", `"use server"; export async function fromApp(){}`],
    ["app/page.tsx", `export default function Page(){ return null; }`],
    ["tests/fixture.ts", `"use server"; export async function fromTest(){}`],
    ["node_modules/pkg/actions.ts", `"use server"; export async function fromPackage(){}`],
    [".next/server/actions.ts", `"use server"; export async function generated(){}`],
    ["artifacts/actions.ts", `"use server"; export async function artifact(){}`],
  ]);
  assert.deepEqual(serverActionFiles(sourceMap), ["app/admin/actions.ts", "lib/actions.ts"]);

  const reexportMap = new Map([["app/reexport.ts", `
    "use server";
    async function hidden(){}
    export { hidden as action };
  `]]);
  assert.throws(
    () => exportedAsyncActions("app/reexport.ts", parseTrees(reexportMap)),
    /value re-export/
  );
});

test("inline use-server functions and arrows are discovered anywhere in app or lib", () => {
  const sourceMap = new Map([
    ["app/page.tsx", `export default function Page(){ async function nested(){ "use server"; } return null; }`],
    ["lib/inline.ts", `export const wrapper=()=>{ const arrow=async()=>{ "use server"; }; return arrow; };`],
    ["scripts/ignored.ts", `async function scriptAction(){ "use server"; }`],
  ]);
  const trees = parseTrees(sourceMap);
  assert.deepEqual(
    projectActionDeclarations(sourceMap, trees).map((action) => `${action.file}:${action.name}`).sort(),
    ["app/page.tsx:nested", "lib/inline.ts:arrow"]
  );

  const eventSourceMap = new Map([["app/event-page.tsx", `
    import { db } from "@/db";
    import { events } from "@/db/schema";
    import { authorizeEventAction } from "@/lib/access";
    export default function Page(){
      async function inlineEvent(){
        "use server";
        await authorizeEventAction("inlineEvent", 1);
        await db.insert(events);
      }
      return null;
    }
  `]]);
  const eventTrees = parseTrees(eventSourceMap);
  const [inlineEvent] = projectActionDeclarations(eventSourceMap, eventTrees);
  assert.ok(touchedEventResources(inlineEvent, eventTrees).size > 0);
  assert.deepEqual(auditActionShape(inlineEvent, eventTrees), []);
});

test("ordinary project helpers cannot mutate event resources outside audited actions", () => {
  assert.deepEqual(forbiddenProjectEventMutationRegions(projectSources), []);

  const eagerBuilderFixture = new Map([
    ["lib/helper.ts", `import { db } from "@/db"; import { events } from "@/db/schema"; export const hiddenMutation=db.delete(events);`],
    ["app/actions.ts", `"use server"; import { hiddenMutation } from "@/lib/helper"; export async function probe(){ await hiddenMutation; }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(eagerBuilderFixture),
    ["lib/helper.ts:hiddenMutation"]
  );

  const eagerExpressionFixture = new Map([
    ["lib/helper.ts", `import { db } from "@/db"; import { events } from "@/db/schema"; db.delete(events);`],
  ]);
  assert.match(
    forbiddenProjectEventMutationRegions(eagerExpressionFixture).join("\n"),
    /<module-expression@/
  );

  const helperFixture = new Map([
    ["lib/helper.ts", `import { db } from "@/db"; import { events } from "@/db/schema"; export async function hidden(){ await db.insert(events); }`],
    ["app/actions.ts", `"use server"; import { hidden } from "@/lib/helper"; export async function probe(){ await hidden(); }`],
  ]);
  assert.deepEqual(forbiddenProjectEventMutationRegions(helperFixture), ["lib/helper.ts:hidden"]);

  const relativeSchemaFixture = new Map([
    ["lib/helper.ts", `import { db } from "@/db"; import { events } from "../db/schema"; export async function hidden(){ await db.insert(events); }`],
    ["app/actions.ts", `"use server"; import { hidden } from "@/lib/helper"; export async function probe(){ await hidden(); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(relativeSchemaFixture),
    ["lib/helper.ts:hidden"]
  );

  const reexportSchemaFixture = new Map([
    ["lib/event-schema.ts", `export { events as nights } from "@/db/schema";`],
    ["lib/helper.ts", `import { db } from "@/db"; import { nights } from "@/lib/event-schema"; export async function hidden(){ await db.insert(nights); }`],
    ["app/actions.ts", `"use server"; import { hidden } from "@/lib/helper"; export async function probe(){ await hidden(); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(reexportSchemaFixture),
    ["lib/helper.ts:hidden"]
  );

  const defaultReexportFixture = new Map([
    ["lib/event-table.ts", `export { events as default } from "@/db/schema";`],
    ["lib/helper.ts", `import { db } from "@/db"; import eventTable from "@/lib/event-table"; export async function hidden(){ await db.insert(eventTable); }`],
    ["app/actions.ts", `"use server"; import { hidden } from "@/lib/helper"; export async function probe(){ await hidden(); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(defaultReexportFixture),
    ["lib/helper.ts:hidden"]
  );

  const chainedDefaultReexportFixture = new Map([
    ["lib/event-table.ts", `export { events as default } from "@/db/schema";`],
    ["lib/forwarded-table.ts", `export { default } from "./event-table";`],
    ["lib/helper.ts", `import { db } from "@/db"; import eventTable from "@/lib/forwarded-table"; export async function hidden(){ await db.insert(eventTable); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(chainedDefaultReexportFixture),
    ["lib/helper.ts:hidden"]
  );

  const localDefaultAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; export default events;`],
    ["lib/helper.ts", `import { db } from "@/db"; import table from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(localDefaultAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const exportEqualsFixture = new Map([
    ["lib/event-tables.ts", `import * as schema from "@/db/schema"; export = schema;`],
    ["lib/helper.ts", `import { db } from "@/db"; import tables = require("./event-tables"); export async function hidden(){ await db.insert(tables.events); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(exportEqualsFixture),
    ["lib/helper.ts:hidden"]
  );

  const nestedNamespaceFixture = new Map([
    ["lib/event-tables.ts", `export * as schema from "@/db/schema";`],
    ["lib/helper.ts", `import { db } from "@/db"; import * as bag from "./event-tables"; export async function hidden(){ await db.insert(bag.schema.events); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(nestedNamespaceFixture),
    ["lib/helper.ts:hidden"]
  );

  const commonJsLoaderFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; export default events;`],
    ["lib/helper.ts", `import { db } from "@/db"; export async function hidden(){ const table=require("./event-table"); await db.insert(table.default); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(commonJsLoaderFixture),
    ["lib/helper.ts:hidden"]
  );

  const commonJsExportsPropertyFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; exports.table=events;`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(commonJsExportsPropertyFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const commonJsModuleObjectFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; module.exports={events};`],
    ["lib/helper.ts", `import { db } from "@/db"; const tables=require("./event-table"); export async function hidden(){ await db.insert(tables.events); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(commonJsModuleObjectFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const commonJsModulePropertyFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; module.exports.table=events;`],
    ["lib/helper.ts", `import { db } from "@/db"; const tables=require("./event-table"); export async function hidden(){ await db.insert(tables.table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(commonJsModulePropertyFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const computedCommonJsPropertyFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; exports["ta"+"ble"]=events;`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(computedCommonJsPropertyFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const assignedCommonJsObjectFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; Object.assign(exports,{table:events});`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(assignedCommonJsObjectFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const definedCommonJsPropertyFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; Object.defineProperty(exports,"table",{value:events});`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(definedCommonJsPropertyFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const definedCommonJsPropertiesFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; Object.defineProperties(exports,{table:{value:events}});`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(definedCommonJsPropertiesFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const aliasedCommonJsPublisherFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; const publish=Object.assign; publish(exports,{table:events});`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(aliasedCommonJsPublisherFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const hoistedCommonJsObjectFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; const tables={table:events}; module.exports=tables;`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(hoistedCommonJsObjectFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const factoryCommonJsObjectFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; function tables(){return {table:events}} module.exports=tables();`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(factoryCommonJsObjectFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const callbackCommonJsPublisherFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; [events].forEach(table=>{exports.table=table});`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(callbackCommonJsPublisherFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const assignedContainerCommonJsFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; const api={}; api.table=events; module.exports=api;`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(assignedContainerCommonJsFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const assignedResourceCommonJsFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; table=events; module.exports={table};`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(assignedResourceCommonJsFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const classContainerCommonJsFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; class Tables{static table=events} module.exports=Tables;`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(classContainerCommonJsFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const exportedFactoryFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; export function table(){return events}`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table()); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(exportedFactoryFixture),
    ["lib/helper.ts:hidden"]
  );

  const exportedResourceConstFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; export const table=events;`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(exportedResourceConstFixture),
    ["lib/helper.ts:hidden"]
  );

  const exportedFactoryToCommonJsFixture = new Map([
    ["lib/event-source.ts", `import { events } from "@/db/schema"; export function make(){return {table:events}}`],
    ["lib/event-table.ts", `import { make } from "./event-source"; module.exports=make();`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(exportedFactoryToCommonJsFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const destructuredAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; ({table}={table:events}); export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(destructuredAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const arrayAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; [table]=[events]; export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(arrayAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const shadowedParameterFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; export function identity(events){return events}`],
    ["lib/helper.ts", `import { db } from "@/db"; import {users} from "@/db/schema"; import {identity} from "./event-table"; export async function benign(){ await db.insert(identity(users)); }`],
  ]);
  assert.deepEqual(forbiddenProjectEventMutationRegions(shadowedParameterFixture), []);

  const destructuredDefaultFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; ({table=events}={}); export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(destructuredDefaultFixture),
    ["lib/helper.ts:hidden"]
  );

  const arrayDefaultFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; [table=events]=[]; export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(arrayDefaultFixture),
    ["lib/helper.ts:hidden"]
  );

  const shadowedNamespaceParameterFixture = new Map([
    ["lib/event-table.ts", `import * as schema from "@/db/schema"; export function identity(schema){return schema.events}`],
    ["lib/helper.ts", `import { db } from "@/db"; import {users} from "@/db/schema"; import {identity} from "./event-table"; export async function benign(){ await db.insert(identity({events:users})); }`],
  ]);
  assert.deepEqual(forbiddenProjectEventMutationRegions(shadowedNamespaceParameterFixture), []);

  const conditionalAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; if(true)table=events; export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(conditionalAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const nullishAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; table??=events; export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(nullishAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const assignedIntermediateContainerFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; const api={}; Object.assign(api,{table:events}); module.exports=api;`],
    ["lib/helper.ts", `import { db } from "@/db"; const {table}=require("./event-table"); export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(assignedIntermediateContainerFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const classStaticBlockAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; class Init{static{table=events}} export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(classStaticBlockAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const classStaticFieldAssignmentFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; class Init{static setup=(table=events)} export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(classStaticFieldAssignmentFixture),
    ["lib/helper.ts:hidden"]
  );

  const classHeritageSideEffectFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; function makeBase(value){table=value;return class{}} class Init extends makeBase(events){} export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(classHeritageSideEffectFixture),
    ["lib/helper.ts:hidden"]
  );

  const eagerArrowSideEffectFixture = new Map([
    ["lib/event-table.ts", `import { events } from "@/db/schema"; let table; const publish=(value)=>{table=value}; publish(events); export {table};`],
    ["lib/helper.ts", `import { db } from "@/db"; import {table} from "./event-table"; export async function hidden(){ await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(eagerArrowSideEffectFixture),
    ["lib/helper.ts:hidden"]
  );

  const requireAliasFixture = new Map([
    ["lib/event-table.ts", `export { events as table } from "@/db/schema";`],
    ["lib/helper.ts", `import { db } from "@/db"; const load=require; export async function hidden(){ const {table}=load("./event-table"); await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(requireAliasFixture),
    ["lib/helper.ts:hidden"]
  );

  const boundRequireAliasFixture = new Map([
    ["lib/event-table.ts", `export { events as table } from "@/db/schema";`],
    ["lib/helper.ts", `import { db } from "@/db"; const load=require.bind(null); export async function hidden(){ const {table}=load("./event-table"); await db.insert(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(boundRequireAliasFixture),
    ["lib/helper.ts:hidden"]
  );

  const unrelatedDefaultFixture = new Map([
    ["lib/unrelated.ts", `export default "not-an-event-resource";`],
    ["lib/helper.ts", `import { db } from "@/db"; import unrelated from "@/lib/unrelated"; export async function allowed(){ await db.insert(unrelated); }`],
  ]);
  assert.deepEqual(forbiddenProjectEventMutationRegions(unrelatedDefaultFixture), []);

  const returnedMethodFixture = new Map([
    ["lib/helper.ts", `import { db } from "@/db"; import { events } from "@/db/schema"; export function hidden(){ return { write:db.insert, table:events }; }`],
    ["app/actions.ts", `"use server"; import { hidden } from "@/lib/helper"; export async function probe(){ const {write,table}=hidden(); await write(table); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(returnedMethodFixture),
    ["lib/helper.ts:hidden"]
  );

  const splitHelperFixture = new Map([
    ["lib/helper.ts", `import { db } from "@/db"; import { events } from "@/db/schema"; export function table(){ return events; } export function writer(){ return db.insert; }`],
    ["app/actions.ts", `"use server"; import { table,writer } from "@/lib/helper"; export async function probe(){ await writer()(table()); }`],
  ]);
  assert.deepEqual(
    forbiddenProjectEventMutationRegions(splitHelperFixture),
    ["lib/helper.ts:<split-event-capability>"]
  );

  const carrierFixture = new Map([["lib/carriers.ts", `
    import { db } from "@/db";
    import { events } from "@/db/schema";
    (()=>db.delete(events))();
    class Carrier { static pending=db.update(events); }
  `]]);
  const carrierViolations = forbiddenProjectEventMutationRegions(carrierFixture);
  assert.equal(carrierViolations.length, 2);
  assert.match(carrierViolations.join("\n"), /<function@/);
  assert.match(carrierViolations.join("\n"), /<initializer@/);
});

test("default-imported schema re-exports remain inside the authorization inventory", () => {
  const sourceMap = new Map([
    ["lib/event-table.ts", `export { events as default } from "@/db/schema";`],
    ["app/actions.ts", `
      "use server";
      import { db } from "@/db";
      import eventTable from "@/lib/event-table";
      export async function bypass(){ await db.insert(eventTable).values({}); }
    `],
  ]);
  const trees = parseTrees(sourceMap);
  const [action] = exportedAsyncActions("app/actions.ts", trees);
  assert.deepEqual([...touchedEventResources(action, trees)], ["eventTable"]);
  assert.deepEqual(auditActionShape(action, trees), [
    "exactly one named policy hook required",
    "policy hook must be a direct awaited top-level statement without wrappers",
  ]);
});

test("the executable inventory semantically covers all 39 event Server Actions", () => {
  assert.deepEqual(
    files,
    serverActionFiles(projectSources),
    "Server Action discovery must cover every use-server source module across the project"
  );
  const names = declarations.map((declaration) => declaration.name);
  assert.equal(new Set(names).size, names.length, "exported Server Action names must be unique");

  const resourceTouching = declarations.filter(
    (declaration) => touchedEventResources(declaration).size > 0
  );
  const discovered = resourceTouching
    .filter((declaration) => !eventResourceMaintenanceExceptions.has(declaration.name))
    .map((declaration) => declaration.name)
    .sort();
  const maintenance = resourceTouching
    .filter((declaration) => eventResourceMaintenanceExceptions.has(declaration.name))
    .map((declaration) => declaration.name)
    .sort();

  const inventoried = Object.keys(EVENT_ACTION_AUTHORIZATION).sort();

  assert.equal(inventoried.length, 39);
  assert.deepEqual(inventoried, discovered);
  assert.deepEqual(maintenance, [...eventResourceMaintenanceExceptions].sort());
  assert.equal(new Set(inventoried).size, inventoried.length);

  const accessSource = fs.readFileSync(path.join(projectRoot, "lib/access.ts"), "utf8");
  assert.equal(
    [...accessSource.matchAll(/export const EVENT_ACTION_AUTHORIZATION/g)].length,
    1,
    "authorization inventory must have one source of truth"
  );
});

test("event data access cannot hide inside module-level executable containers", () => {
  for (const file of files) {
    for (const helper of moduleLevelExecutableContainers(file)) {
      assert.equal(
        touchedEventResources(helper).size,
        0,
        `${file}:${helper.name} must not hide event-resource access from exported-action audit`
      );
    }
  }
});

test("class, object-method, and nested-function carriers cannot hide event access", () => {
  const source = `
    "use server";
    import { events } from "@/db/schema";
    class ClassCarrier {
      static async mutate() { async function nested(){ await db.insert(events); } await nested(); }
    }
    const objectCarrier = { async mutate(){ await db.update(events); } };
    async function functionCarrier(){ const nested = async () => db.delete(events); await nested(); }
    export async function probe(){ await ClassCarrier.mutate(); await objectCarrier.mutate(); await functionCarrier(); }
  `;
  const sourceMap = new Map([["app/carrier-actions.ts", source]]);
  const trees = parseTrees(sourceMap);
  const action = exportedAsyncActions("app/carrier-actions.ts", trees)[0];
  assert.equal(touchedEventResources(action, trees).size, 0, "carrier call hides direct action touch");
  const carriers = moduleLevelExecutableContainers("app/carrier-actions.ts", trees)
    .filter((container) => touchedEventResources(container, trees).size > 0)
    .map((container) => container.name)
    .sort();
  assert.deepEqual(carriers, ["ClassCarrier", "functionCarrier", "objectCarrier"]);
});

test("every inventoried action names its runtime policy hook inside its production module", () => {
  for (const action of Object.keys(EVENT_ACTION_AUTHORIZATION)) {
    const owners = declarations.filter((declaration) => declaration.name === action);
    assert.equal(owners.length, 1, `${action} must have exactly one exported implementation`);
    const hooks = namedPolicyHooks(owners[0]);
    assert.equal(
      hooks.length,
      1,
      `${action} must invoke its named executable policy exactly once`
    );
    const mutations = databaseMutations(owners[0]);
    if (mutations.length > 0) {
      assert.ok(
        hooks[0].getStart() < Math.min(...mutations.map((mutation) => mutation.getStart())),
        `${action} must authorize before its first database mutation`
      );
    }
    assert.deepEqual(auditActionShape(owners[0]), [], `${action} canonical policy shape`);
  }
});

test("inventory rejects dead hooks, computed writes, aliases, and namespace resources", () => {
  const policyImport = `import { authorizeEventAction } from "@/lib/access"; `;
  const fixtures = [
    {
      name: "dead hook",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ if(false){ await authorizeEventAction("probe", 1); } await db.insert(events); }`,
      error: /top-level/,
    },
    {
      name: "short-circuit hook",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ false && await authorizeEventAction("probe", 1); await db.insert(events); }`,
      error: /direct awaited top-level/,
    },
    {
      name: "unawaited hook",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ authorizeEventAction("probe", 1); await db.insert(events); }`,
      error: /direct awaited top-level/,
    },
    {
      name: "swallowed denial",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe", 1).catch(()=>{}); await db.insert(events); }`,
      error: /direct awaited top-level/,
    },
    {
      name: "computed write",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe", 1); await db["insert"](events); }`,
      touched: true,
    },
    {
      name: "aliased resource",
      source: `${policyImport}import { events as nights } from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe", 1); await db.insert(nights); }`,
      touched: true,
    },
    {
      name: "namespace resource",
      source: `${policyImport}import * as schema from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe", 1); await db.insert(schema["events"]); }`,
      touched: true,
    },
    {
      name: "local resource alias",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe", 1); const nights=events; await db.insert(nights); }`,
      error: /aliases are forbidden/,
    },
    {
      name: "namespace local alias",
      source: `${policyImport}import * as schema from "@/db/schema"; export async function probe(){ const local=schema; await authorizeEventAction("probe", 1); await db.insert(local.events); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "database receiver alias",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ const store=db; await store.insert(events); await authorizeEventAction("probe", 1); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "cast database receiver alias",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ const store=db as typeof db; await store.insert(events); await authorizeEventAction("probe", 1); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "fake policy helper",
      source: `import { events } from "@/db/schema"; export async function probe(){ const authorizeEventAction=async()=>({}); await authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /exactly one named policy hook/,
    },
    {
      name: "destructured fake policy helper",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ const { authorizeEventAction }={ authorizeEventAction:async()=>({}) }; await authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /bindings may not be shadowed/,
    },
    {
      name: "parameter-shadowed policy helper",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe({ authorizeEventAction }){ await authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /bindings may not be shadowed/,
    },
    {
      name: "catch-binding-shadowed policy helper",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ try{}catch({ authorizeEventAction }){} await authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /bindings may not be shadowed/,
    },
    {
      name: "nested-array-binding-shadowed policy helper",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ const { policies:[authorizeEventAction] }={ policies:[async()=>({})] }; await authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /bindings may not be shadowed/,
    },
    {
      name: "function-shadowed policy helper",
      source: `${policyImport}import { events } from "@/db/schema"; export async function probe(){ async function authorizeEventAction(){ return {}; } await authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /bindings may not be shadowed/,
    },
    {
      name: "dynamic schema import",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const { events }=await import("@/db/schema"); await db.insert(events); }`,
      touched: true,
      error: /schema imports are forbidden/,
    },
    {
      name: "computed schema import",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const { events }=await import("@/db/"+"schema"); await db.insert(events); }`,
      touched: true,
      error: /schema imports are forbidden/,
    },
    {
      name: "required schema",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const { events }=require("@/db/schema"); await db.insert(events); }`,
      touched: true,
      error: /schema imports are forbidden/,
    },
    {
      name: "TypeScript import-equals schema",
      source: `${policyImport}import schema = require("@/db/schema"); export async function probe(){ await authorizeEventAction("probe",1); await db.insert(schema.events); }`,
      touched: true,
      clean: true,
    },
    {
      name: "unknown dynamic import",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const moduleName=getModule(); const { events }=await import(moduleName); await db.insert(events); }`,
      touched: true,
      error: /schema imports are forbidden/,
    },
    {
      name: "namespace rest resource",
      source: `${policyImport}import * as schema from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe",1); const { ...rest }=schema; await db.insert(rest.events); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "cast namespace receiver",
      source: `${policyImport}import * as schema from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe",1); const nights=(schema as typeof schema).events; await db.insert(nights); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "relational event query",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); await db.query.events.findFirst(); }`,
      touched: true,
      clean: true,
    },
    {
      name: "computed relational event query",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); await db.query["eventInvitees"].findMany(); }`,
      touched: true,
      clean: true,
    },
    {
      name: "cast relational query alias",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const query=(db satisfies typeof db)!.query; await query.events.findMany(); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "destructured relational query alias",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const { events:eventQuery }=db.query; await eventQuery.findMany(); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "rest relational query alias",
      source: `${policyImport}export async function probe(){ await authorizeEventAction("probe",1); const { ...relations }=db.query; await relations["eventInvitees"].findMany(); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
    {
      name: "namespace policy import",
      source: `import * as access from "@/lib/access"; import { events } from "@/db/schema"; export async function probe(){ await access.authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      clean: true,
    },
    {
      name: "shadowed namespace policy import",
      source: `import * as access from "@/lib/access"; import { events } from "@/db/schema"; export async function probe(){ const { access = { authorizeEventAction:async()=>({}) } }={}; await access.authorizeEventAction("probe",1); await db.insert(events); }`,
      touched: true,
      error: /bindings may not be shadowed/,
    },
    {
      name: "defaulted namespace resource binding",
      source: `${policyImport}import * as schema from "@/db/schema"; export async function probe(){ await authorizeEventAction("probe",1); const { events:nights = null }=schema; await db.insert(nights); }`,
      touched: true,
      error: /aliases are forbidden/,
    },
  ];
  for (const fixture of fixtures) {
    const sourceMap = new Map([["fixture.ts", fixture.source]]);
    const trees = parseTrees(sourceMap);
    const declaration = exportedAsyncActions("fixture.ts", trees)[0];
    assert.ok(declaration, fixture.name);
    if (fixture.touched) assert.ok(touchedEventResources(declaration, trees).size > 0, fixture.name);
    if (fixture.error) assert.match(auditActionShape(declaration, trees).join("; "), fixture.error, fixture.name);
    if (fixture.clean) assert.deepEqual(auditActionShape(declaration, trees), [], fixture.name);
  }
});

test("the explicit global maintenance exception authenticates an admin before event cleanup", () => {
  for (const action of eventResourceMaintenanceExceptions) {
    const declaration = declarations.find((candidate) => candidate.name === action);
    assert.ok(declaration, `${action} maintenance action exists`);
    const adminHooks = visitBody(
      declaration.body,
      (node) =>
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "requireAdmin"
    );
    assert.equal(adminHooks.length, 1, `${action} must require admin exactly once`);
    const firstResource = Math.min(
      ...visitBody(
        declaration.body,
        (node) => ts.isIdentifier(node) && eventResourceIdentifiers.has(node.text)
      ).map((node) => node.getStart())
    );
    assert.ok(adminHooks[0].getStart() < firstResource, `${action} authenticates before event access`);
  }
});

test("every policy declares a capability and an explicit state boundary", () => {
  for (const [action, rule] of Object.entries(EVENT_ACTION_AUTHORIZATION)) {
    assert.equal(typeof rule.capability, "string", `${action} capability`);
    assert.ok(
      rule.states === null || (Array.isArray(rule.states) && rule.states.length > 0),
      `${action} state boundary`
    );
  }
});
