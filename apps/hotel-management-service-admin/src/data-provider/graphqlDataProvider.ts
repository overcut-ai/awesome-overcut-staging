import buildGraphQLProvider from "ra-data-graphql-amplication";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { CREDENTIALS_LOCAL_STORAGE_ITEM } from "../constants";

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_REACT_APP_SERVER_URL}/graphql`,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_ITEM);
  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    },
  };
});

/**
 * RCA #64 operational note:
 * This cache now scopes entity identity by tenant + session to prevent cross-tenant/session cache reuse.
 * During rollout, flush any persisted legacy Apollo cache entries that were created without this scope.
 */
const tenantSessionScopeVar = () => {
  const token = localStorage.getItem(CREDENTIALS_LOCAL_STORAGE_ITEM);

  if (!token) {
    return "unscoped";
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return "unscoped";
    }

    const decodedPayload = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
    const tenantId = decodedPayload?.tenantId ?? decodedPayload?.tenant?.id;
    const sessionId = decodedPayload?.sessionId ?? decodedPayload?.sid;

    if (!tenantId || !sessionId) {
      return "unscoped";
    }

    return `${String(tenantId)}:${String(sessionId)}`;
  } catch {
    return "unscoped";
  }
};

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    dataIdFromObject(responseObject) {
      const typename = responseObject.__typename;
      const objectId = (responseObject as { id?: string | number }).id;

      if (!typename || objectId === undefined || objectId === null) {
        return undefined;
      }

      const scope = tenantSessionScopeVar();

      if (scope === "unscoped") {
        return undefined;
      }

      return `${scope}:${typename}:${String(objectId)}`;
    },
  }),
  link: authLink.concat(httpLink),
});

export default buildGraphQLProvider({
  client: apolloClient,
});
