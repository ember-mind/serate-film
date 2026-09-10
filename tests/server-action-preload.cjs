const Module = require("node:module");

const contextKey = Symbol.for("serate-film.server-action-test-context");
globalThis[contextKey] = { sessionToken: null };

class TestRedirect extends Error {
  constructor(location) {
    super(`redirect:${location}`);
    this.name = "TestRedirect";
    this.location = location;
  }
}

const originalLoad = Module._load;
Module._load = function loadForServerActionTest(request, parent, isMain) {
  if (request === "server-only") return {};
  if (request === "next/cache") {
    return {
      revalidatePath() {},
      revalidateTag() {},
      updateTag() {},
    };
  }
  if (request === "next/navigation") {
    return {
      redirect(location) {
        throw new TestRedirect(location);
      },
    };
  }
  if (request === "next/headers") {
    return {
      async cookies() {
        return {
          get(name) {
            const token = globalThis[contextKey].sessionToken;
            return name === "serate_session" && token ? { name, value: token } : undefined;
          },
          set() {},
          delete() {},
        };
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

globalThis.__serateServerActionTest = {
  setSessionToken(sessionToken) {
    globalThis[contextKey].sessionToken = sessionToken;
  },
  TestRedirect,
};
