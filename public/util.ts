type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update User",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: "input", password: "input" } },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Get Posts (empty for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { message: "input", content: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", update: { message: "input" } },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  // {
  //   name: "Create Counter",
  //   endpoint: "/api/counters",
  //   method: "POST",
  //   fields: {},
  // },
  // {
  //   name: "Get Count",
  //   endpoint: "/api/counters/:id",
  //   method: "GET",
  //   fields: { id: "input" },
  // },
  // {
  //   name: "Delete Count",
  //   endpoint: "/api/counters/:id",
  //   method: "DELETE",
  //   fields: { id: "input" },
  // },
  // {
  //   name: "Get Counters",
  //   endpoint: "/api/counters",
  //   method: "GET",
  //   fields: {},
  // },
  // {
  //   name: "Update Count",
  //   endpoint: "/api/counters/:id",
  //   method: "PATCH",
  //   fields: { id: "input", amount: "input" },
  // },
  // {
  //   name: "Create Timer",
  //   endpoint: "/api/timers",
  //   method: "POST",
  //   fields: {},
  // },
  // {
  //   name: "Get Time",
  //   endpoint: "/api/timers/:id",
  //   method: "GET",
  //   fields: { id: "input" },
  // },
  // {
  //   name: "Delete Timer",
  //   endpoint: "/api/timers/:id",
  //   method: "DELETE",
  //   fields: { id: "input" },
  // },
  // {
  //   name: "Get Timers",
  //   endpoint: "/api/timers",
  //   method: "GET",
  //   fields: {},
  // },
  {
    name: "Create Feed",
    endpoint: "/api/feed",
    method: "POST",
    fields: {},
  },
  // {
  //   name: "Get all Feeds",
  //   endpoint: "/api/feed",
  //   method: "GET",
  //   fields: {},
  // },
  // {
  //   name: "Get next in Feed",
  //   endpoint: "/api/feed",
  //   method: "GET",
  //   fields: {},
  // },
  {
    name: "Get next content",
    endpoint: "/api/feed",
    method: "PATCH",
    fields: {},
  },
  // {
  //   name: "Delete Feed",
  //   endpoint: "/api/feed/owner:",
  //   method: "DELETE",
  //   fields: { owner: "input" },
  // },
  {
    name: "Disable Object",
    endpoint: "/api/disable/:id",
    method: "POST",
    fields: { id: "input" },
  },
  {
    name: "Check Object is disabled",
    endpoint: "/api/disable/:id",
    method: "GET",
    fields: { id: "input" },
  },
  {
    name: "Enable Object",
    endpoint: "/api/disable/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  {
    name: "Get Feed Stats",
    endpoint: "/api/feed/stats",
    method: "GET",
    fields: {},
  },
  {
    name: "Reset Stats",
    endpoint: "/api/feed/stats",
    method: "PATCH",
    fields: {},
  },
  {
    name: "Add Content to queue",
    endpoint: "/api/feed/queue",
    method: "PATCH",
    fields: { numItems: "input" },
  },
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${tag} name="${prefix}${name}"></${tag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
