import Routes from "./router";

export interface Env {
  DISCORD_PUBLIC_KEY: string;
  DB: KVNamespace;
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
};

type InteractionData = {
  type: number;
  name: string;
  id: Snowflake;
  options: InteractionOption[];
};

type Member = {
  user: {
    id: Snowflake;
    username: string;
  };
  nick: string | null;
  joined_at: string;
};

type Interaction = {
  type: InteractionType;
  id: Snowflake;
  data: InteractionData;
  guildId: Snowflake;
  channelId: Snowflake;
  member: Member;
  token: string;
};

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    return Routes(env).handle(request);
  },
};

async function interactionResponse(
  interaction: Interaction,
  DB: KVNamespace
): Promise<object> {
  const { member, data } = interaction;
  const username = member.user.username;
  const nickname = member.nick || username;
  const params = data.options.reduce(
    (options: { [key: string]: string }, option: InteractionOption) => {
      options[option.name] = option.value;

      return options;
    },
    {}
  );

  let val = await DB.get(`testing_${username}`);
  if (!val) {
    val = `Hello ${params.url}`;
    await DB.put(`testing_${username}`, params.url);
  }

  return Promise.resolve({
    type: 4,
    data: {
      content: `Hello ${nickname}, we'll get you setup: \`@${username}@nor.dev => ${params.url}\``,
    },
  });
}
