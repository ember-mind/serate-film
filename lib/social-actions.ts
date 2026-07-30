"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  circleFollows,
  circleMembers,
  circles,
  userProfiles,
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { requireCircleAccess } from "@/lib/access";

const VISIBILITIES = new Set(["private", "unlisted", "public"]);
const JOIN_POLICIES = new Set(["invite", "request", "open"]);
const PROFILE_VISIBILITIES = new Set(["private", "circles", "public"]);

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function uniqueCircleSlug(name: string) {
  const base = slugify(name) || "circolo";
  let candidate = base;
  let suffix = 2;
  while (
    await db.query.circles.findFirst({
      where: eq(circles.slug, candidate),
      columns: { id: true },
    })
  ) {
    candidate = `${base.slice(0, 44)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createCircle(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const rawVisibility = String(formData.get("visibility") ?? "private");
  const rawJoinPolicy = String(formData.get("joinPolicy") ?? "invite");
  const visibility = VISIBILITIES.has(rawVisibility)
    ? (rawVisibility as "private" | "unlisted" | "public")
    : "private";
  const joinPolicy = JOIN_POLICIES.has(rawJoinPolicy)
    ? (rawJoinPolicy as "invite" | "request" | "open")
    : "invite";

  if (name.length < 2) redirect("/circoli?errore=nome");

  const slug = await uniqueCircleSlug(name);
  db.transaction((tx) => {
    const [circle] = tx
      .insert(circles)
      .values({
        name,
        slug,
        description,
        ownerId: user.id,
        visibility,
        joinPolicy,
      })
      .returning()
      .all();
    tx.insert(circleMembers)
      .values({
        circleId: circle.id,
        userId: user.id,
        role: "owner",
        status: "active",
        invitedBy: user.id,
      })
      .run();
  });

  revalidatePath("/circoli");
  revalidatePath("/club");
  redirect(`/circoli/${slug}?creato=1`);
}

export async function updateCircle(circleId: number, formData: FormData) {
  const user = await requireUser();
  const { circle, membership } = await requireCircleAccess(circleId, user, "manage");
  if (
    !user.isAdmin &&
    circle.ownerId !== user.id &&
    membership?.role !== "moderator"
  ) {
    return;
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const description =
    String(formData.get("description") ?? "").trim().slice(0, 500) || null;
  const rawVisibility = String(formData.get("visibility") ?? circle.visibility);
  const rawJoinPolicy = String(formData.get("joinPolicy") ?? circle.joinPolicy);
  const visibility = VISIBILITIES.has(rawVisibility)
    ? (rawVisibility as "private" | "unlisted" | "public")
    : circle.visibility;
  const joinPolicy = JOIN_POLICIES.has(rawJoinPolicy)
    ? (rawJoinPolicy as "invite" | "request" | "open")
    : circle.joinPolicy;
  if (name.length < 2) return;

  await db
    .update(circles)
    .set({
      name,
      description,
      visibility,
      joinPolicy,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(circles.id, circleId));

  revalidatePath(`/circoli/${circle.slug}`);
  revalidatePath(`/club/${circle.slug}`);
  revalidatePath("/circoli");
  revalidatePath("/club");
}

export async function inviteCircleMember(circleId: number, formData: FormData) {
  const user = await requireUser();
  const { circle } = await requireCircleAccess(circleId, user, "manage");
  const userId = Number(formData.get("userId"));
  if (!Number.isInteger(userId) || userId === circle.ownerId) return;

  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true },
  });
  if (!target) return;

  await db
    .insert(circleMembers)
    .values({
      circleId,
      userId,
      role: "member",
      status: "invited",
      invitedBy: user.id,
    })
    .onConflictDoUpdate({
      target: [circleMembers.circleId, circleMembers.userId],
      set: {
        status: "invited",
        role: "member",
        invitedBy: user.id,
        joinedAt: new Date().toISOString(),
      },
    });

  revalidatePath(`/circoli/${circle.slug}`);
  revalidatePath("/circoli");
}

export async function removeCircleMember(circleId: number, userId: number) {
  const user = await requireUser();
  const { circle, membership } = await requireCircleAccess(circleId, user, "manage");
  if (userId === circle.ownerId) return;

  const target = await db.query.circleMembers.findFirst({
    where: and(
      eq(circleMembers.circleId, circleId),
      eq(circleMembers.userId, userId)
    ),
  });
  if (!target) return;
  if (
    !user.isAdmin &&
    membership?.role === "moderator" &&
    target.role !== "member"
  ) {
    return;
  }

  await db
    .delete(circleMembers)
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId)
      )
    );
  revalidatePath(`/circoli/${circle.slug}`);
  revalidatePath("/circoli");
  revalidatePath(`/club/${circle.slug}`);
}

export async function setCircleMemberRole(
  circleId: number,
  userId: number,
  formData: FormData
) {
  const user = await requireUser();
  const { circle } = await requireCircleAccess(circleId, user, "manage");
  if (!user.isAdmin && circle.ownerId !== user.id) return;
  if (userId === circle.ownerId) return;

  const rawRole = String(formData.get("role") ?? "member");
  const role = rawRole === "moderator" ? "moderator" : "member";
  await db
    .update(circleMembers)
    .set({ role })
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.status, "active")
      )
    );
  revalidatePath(`/circoli/${circle.slug}`);
}

export async function acceptCircleInvite(circleId: number) {
  const user = await requireUser();
  const circle = await db.query.circles.findFirst({
    where: eq(circles.id, circleId),
  });
  if (!circle) return;
  await db
    .update(circleMembers)
    .set({ status: "active", joinedAt: new Date().toISOString() })
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, user.id),
        eq(circleMembers.status, "invited")
      )
    );
  revalidatePath("/circoli");
  revalidatePath(`/circoli/${circle.slug}`);
  redirect(`/circoli/${circle.slug}?unito=1`);
}

export async function declineCircleInvite(circleId: number) {
  const user = await requireUser();
  await db
    .delete(circleMembers)
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, user.id),
        eq(circleMembers.status, "invited")
      )
    );
  revalidatePath("/circoli");
}

export async function requestCircleMembership(circleId: number) {
  const user = await requireUser();
  const circle = await db.query.circles.findFirst({
    where: eq(circles.id, circleId),
  });
  if (!circle || circle.visibility !== "public") return;

  const existing = await db.query.circleMembers.findFirst({
    where: and(
      eq(circleMembers.circleId, circleId),
      eq(circleMembers.userId, user.id)
    ),
  });
  if (existing?.status === "active") return;

  const status = existing?.status === "invited" || circle.joinPolicy === "open"
    ? "active"
    : circle.joinPolicy === "request"
      ? "requested"
      : null;
  if (!status) return;

  await db
    .insert(circleMembers)
    .values({ circleId, userId: user.id, status, role: "member" })
    .onConflictDoUpdate({
      target: [circleMembers.circleId, circleMembers.userId],
      set: { status, joinedAt: new Date().toISOString() },
    });
  revalidatePath(`/club/${circle.slug}`);
  revalidatePath(`/circoli/${circle.slug}`);
  revalidatePath("/circoli");
}

export async function approveCircleRequest(circleId: number, userId: number) {
  const user = await requireUser();
  const { circle } = await requireCircleAccess(circleId, user, "manage");
  await db
    .update(circleMembers)
    .set({ status: "active", joinedAt: new Date().toISOString() })
    .where(
      and(
        eq(circleMembers.circleId, circleId),
        eq(circleMembers.userId, userId),
        eq(circleMembers.status, "requested")
      )
    );
  revalidatePath(`/circoli/${circle.slug}`);
  revalidatePath(`/club/${circle.slug}`);
}

export async function toggleCircleFollow(circleId: number) {
  const user = await requireUser();
  const circle = await db.query.circles.findFirst({
    where: eq(circles.id, circleId),
  });
  if (!circle || circle.visibility !== "public") return;

  const existing = await db.query.circleFollows.findFirst({
    where: and(
      eq(circleFollows.circleId, circleId),
      eq(circleFollows.userId, user.id)
    ),
  });
  if (existing) {
    await db
      .delete(circleFollows)
      .where(
        and(
          eq(circleFollows.circleId, circleId),
          eq(circleFollows.userId, user.id)
        )
      );
  } else {
    await db.insert(circleFollows).values({ circleId, userId: user.id });
  }
  revalidatePath("/club");
  revalidatePath(`/club/${circle.slug}`);
}

export async function savePrivacyProfile(formData: FormData) {
  const user = await requireUser();
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 280) || null;
  const favoriteGenres =
    String(formData.get("favoriteGenres") ?? "").trim().slice(0, 120) || null;
  const rawVisibility = String(formData.get("visibility") ?? "private");
  const visibility = PROFILE_VISIBILITIES.has(rawVisibility)
    ? (rawVisibility as "private" | "circles" | "public")
    : "private";
  const discoverable =
    visibility === "public" && formData.get("discoverable") === "on";
  const showStats = formData.get("showStats") === "on";
  const allowMentions = formData.get("allowMentions") === "on";

  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });
  if (existing) {
    await db
      .update(userProfiles)
      .set({
        bio,
        favoriteGenres,
        visibility,
        discoverable,
        showStats,
        allowMentions,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(userProfiles.userId, user.id));
  } else {
    await db.insert(userProfiles).values({
      userId: user.id,
      slug: user.username,
      bio,
      favoriteGenres,
      visibility,
      discoverable,
      showStats,
      allowMentions,
    });
  }

  revalidatePath("/io/privacy");
  revalidatePath("/club");
  redirect("/io/privacy?salvato=1");
}
