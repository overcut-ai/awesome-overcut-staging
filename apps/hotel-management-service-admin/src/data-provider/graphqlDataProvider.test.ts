import { CREDENTIALS_LOCAL_STORAGE_ITEM } from "../constants";

const createJwtToken = (payload: Record<string, unknown>) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encodedPayload}.signature`;
};

const setToken = (payload: Record<string, unknown>) => {
  localStorage.setItem(CREDENTIALS_LOCAL_STORAGE_ITEM, createJwtToken(payload));
};

describe("apollo cache tenant/session scoped identity", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  const getDataIdFromObject = async () => {
    const { apolloClient } = await import("./graphqlDataProvider");
    return (apolloClient.cache as any).config.dataIdFromObject as (obj: any) => string | undefined;
  };

  it("generates scoped cache id using tenantId + sessionId", async () => {
    setToken({ tenantId: "tenant-a", sessionId: "session-1" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Hotel", id: "42" })).toBe("tenant-a:session-1:Hotel:42");
  });

  it("falls back to sid when sessionId is not present", async () => {
    setToken({ tenantId: "tenant-a", sid: "sid-1" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Reservation", id: 7 })).toBe("tenant-a:sid-1:Reservation:7");
  });

  it("falls back to nested tenant.id when tenantId is not present", async () => {
    setToken({ tenant: { id: "tenant-nested" }, sessionId: "session-2" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Room", id: "100" })).toBe("tenant-nested:session-2:Room:100");
  });

  it("fails closed when token is missing", async () => {
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Customer", id: "1" })).toBeUndefined();
  });

  it("fails closed when token is malformed", async () => {
    localStorage.setItem(CREDENTIALS_LOCAL_STORAGE_ITEM, "not-a-jwt");
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Customer", id: "1" })).toBeUndefined();
  });

  it("fails closed when tenant is missing", async () => {
    setToken({ sessionId: "session-only" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Hotel", id: "2" })).toBeUndefined();
  });

  it("fails closed when session identifiers are missing", async () => {
    setToken({ tenantId: "tenant-only" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Hotel", id: "2" })).toBeUndefined();
  });

  it("fails closed when typename is missing", async () => {
    setToken({ tenantId: "tenant-a", sessionId: "session-1" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ id: "42" })).toBeUndefined();
  });

  it("fails closed when id is null or undefined", async () => {
    setToken({ tenantId: "tenant-a", sessionId: "session-1" });
    const dataIdFromObject = await getDataIdFromObject();

    expect(dataIdFromObject({ __typename: "Hotel", id: null })).toBeUndefined();
    expect(dataIdFromObject({ __typename: "Hotel" })).toBeUndefined();
  });

  it("prevents collisions across tenants/sessions for same typename and id", async () => {
    const entity = { __typename: "Hotel", id: "55" };

    setToken({ tenantId: "tenant-a", sessionId: "session-1" });
    const dataIdFromObjectA = await getDataIdFromObject();
    const idA = dataIdFromObjectA(entity);

    vi.resetModules();
    setToken({ tenantId: "tenant-b", sessionId: "session-1" });
    const dataIdFromObjectB = await getDataIdFromObject();
    const idB = dataIdFromObjectB(entity);

    vi.resetModules();
    setToken({ tenantId: "tenant-a", sessionId: "session-2" });
    const dataIdFromObjectC = await getDataIdFromObject();
    const idC = dataIdFromObjectC(entity);

    expect(idA).toBe("tenant-a:session-1:Hotel:55");
    expect(idB).toBe("tenant-b:session-1:Hotel:55");
    expect(idC).toBe("tenant-a:session-2:Hotel:55");
    expect(new Set([idA, idB, idC]).size).toBe(3);
  });
});
