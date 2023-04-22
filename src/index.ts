/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
  DISCORD_PUBLIC_KEY: string;

  ALIAS_DB: KVNamespace;
}

type Snowflake = string;

enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
}

type InteractionOption = {
   type: number;
    name: string;
    value: string;

}

type InteractionData = {
  type: number;
  name: string;
  id: Snowflake;
  options: InteractionOption[];
}

type Member = {
  user: {
    id: Snowflake;
    username: string;
  };
  nick: string|null;
  joined_at: string;
}

type Interaction = {
  type: InteractionType;
  id: Snowflake;
  data: InteractionData;
  guildId: Snowflake;
  channelId: Snowflake;
  member: Member;
  token: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		// ctx: ExecutionContext
	): Promise<Response> {
    // @TODO: Install zee itty router

    // console.log(response. );
    // We only accept POSTs
    if (request.method !== 'POST')
      return new Response('Method Not Allowed.', { status: 405 });

    // Verify the request
    const verified = await verifyRequestSignature(env.DISCORD_PUBLIC_KEY, request);
    if (!verified) return new Response('Invalid Request', { status: 401 });

    const body = await request.json() as Interaction;

    console.log(JSON.stringify(body, null, 2));
    // console.log(body.data.options);

    if (body.type === InteractionType.PING) {
      // Respond to a ping
      return json({ type: 1 });
    }

    const response = await interactionResponse(body, env.ALIAS_DB);

    return json(response);
	},
};

function json(data: object, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status
  });
}


async function verifyRequestSignature(
    key: string,
    request: Request,
): Promise<boolean> {
    const timestamp = request.headers.get('X-Signature-Timestamp');
    const sig = request.headers.get('X-Signature-Ed25519');

    if (
      timestamp == null || // No timestamp provided
      (parseInt(timestamp) < Date.now() / 5000) || // Request older than 5s
      sig === null // No signature given
    ) {
      return Promise.resolve(false);
    }

    const body = await request.clone().text();

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      hexToUInt8Array(key),
      { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
      false,
      ['verify'],
    );

    return crypto.subtle.verify(
      'NODE-ED25519',
      cryptoKey,
      hexToUInt8Array(sig),
      new TextEncoder().encode(timestamp + body)
    );
}

function hexToUInt8Array(string: string) {
  // convert string to pairs of 2 characters
  const pairs = string.match(/[\dA-F]{2}/gi) as RegExpMatchArray;

  // convert the octets to integers
  const integers = pairs.map(function (s) {
    return parseInt(s, 16);
  });

  return new Uint8Array(integers);
}

async function interactionResponse(interaction: Interaction, DB: KVNamespace): Promise<object> {
  const { member, data } = interaction;
  const username = member.user.username;
  const nickname = member.nick || username;
  const params = data.options.reduce((options: { [key: string]: string }, option: InteractionOption) => {
      options[option.name] = option.value;

      return options;
  }, {});


  let val = await DB.get(`testing_${username}`);
  if (!val) {
    val = `Hello ${params.url}`;
    await DB.put(`testing_${username}`, params.url);
  }

  
  // const { } = fetchMastadonProfile()

  return Promise.resolve({
    type: 4,
    data: {
      // content: `Hello ${nickname}, we'll get you setup: \`@${username}@nor.dev => ${params.url}\``,
      content: val
    }
  });
}
