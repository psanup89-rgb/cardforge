import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import ResendButton from "./ResendButton";
import DeleteButton from "./DeleteButton";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface CardRow {
  user_id: string;
  status: string;
}

type UserStatus = "active" | "pending" | "unverified";

function getUserStatus(emailConfirmedAt: string | null, lastSignInAt: string | null): UserStatus {
  if (!emailConfirmedAt) return "unverified";
  if (!lastSignInAt) return "pending";
  return "active";
}

export default async function AdminPage() {
  const { data: { session } } = await createServerClient().auth.getSession();
  const currentUserId = session?.user.id;

  const supabase = createServiceClient();

  const [{ data: profiles }, { data: cards }, { data: authData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("business_cards").select("user_id, status"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profileList: Profile[] = profiles ?? [];
  const cardList: CardRow[] = cards ?? [];

  // Map auth user id → { email_confirmed_at, last_sign_in_at }
  const authMap = new Map(
    (authData?.users ?? []).map((u) => [
      u.id,
      {
        emailConfirmedAt: u.email_confirmed_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
      },
    ])
  );

  // Aggregate card counts per user
  const cardStats = cardList.reduce<
    Record<string, { total: number; published: number; draft: number }>
  >((acc, card) => {
    if (!acc[card.user_id]) acc[card.user_id] = { total: 0, published: 0, draft: 0 };
    acc[card.user_id].total++;
    if (card.status === "published") acc[card.user_id].published++;
    else acc[card.user_id].draft++;
    return acc;
  }, {});

  const totalUsers = profileList.length;
  const totalCards = cardList.length;
  const totalPublished = cardList.filter((c) => c.status === "published").length;
  const usersWithCards = profileList.filter((p) => (cardStats[p.id]?.total ?? 0) > 0).length;
  const pendingCount = profileList.filter((p) => {
    const auth = authMap.get(p.id);
    return getUserStatus(auth?.emailConfirmedAt ?? null, auth?.lastSignInAt ?? null) !== "active";
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">User overview and activity</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Pending / Unverified" value={pendingCount} highlight={pendingCount > 0} />
        <StatCard label="Users with Cards" value={usersWithCards} />
        <StatCard label="Total Cards" value={totalCards} />
        <StatCard label="Published Cards" value={totalPublished} />
      </div>

      {/* Users table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          All Users
        </h2>
        <div className="rounded-lg border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Signed Up</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Cards</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Published</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Draft</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profileList.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              )}
              {profileList.map((user) => {
                const stats = cardStats[user.id] ?? { total: 0, published: 0, draft: 0 };
                const auth = authMap.get(user.id);
                const status = getUserStatus(auth?.emailConfirmedAt ?? null, auth?.lastSignInAt ?? null);
                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {user.full_name ?? <span className="text-muted-foreground italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {auth?.lastSignInAt
                        ? new Date(auth.lastSignInAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : <span className="italic">Never</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{stats.total}</td>
                    <td className="px-4 py-3 text-center">
                      {stats.published > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          {stats.published}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stats.draft > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                          {stats.draft}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {status !== "active" && <ResendButton email={user.email} />}
                        {user.id !== currentUserId && (
                          <DeleteButton userId={user.id} name={user.full_name ?? user.email} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        Active
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        Pending login
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Unverified
    </span>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-orange-200 bg-orange-50" : "bg-background"}`}>
      <p className={`text-xs uppercase tracking-wide ${highlight ? "text-orange-600" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className={`mt-1 text-3xl font-bold ${highlight ? "text-orange-700" : ""}`}>{value}</p>
    </div>
  );
}
