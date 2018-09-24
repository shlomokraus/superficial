const regex = /\n\n<!-- probot = (.*) -->/;

/**
 * Stores metadata in PR comments, extracted from metadata bot
 * https://github.com/probot/metadata/blob/master/index.js
 */
export class Persist {
  github;
  context;
  prefix;
  issue;

  constructor(context, issue?) {
    this.github = context.github;
    this.prefix = context.payload.installation.id;
    this.context = context;
    if (!issue) {
      this.issue = context.issue();
    } else {
      this.issue = issue;
    }
  }

  async get(key) {
    let body = this.issue.body;

    if (!body) {
      body = (await this.github.issues.get(this.issue)).data.body;
    }

    const match = body.match(regex);

    if (match) {
      const data = JSON.parse(match[1])[this.prefix];
      return key ? data && data[key] : data;
    }
  }

  async set(key, value) {
    let body = this.issue.body;
    let data = {};

    if (!body) body = (await this.github.issues.get(this.issue)).data.body;

    body = body.replace(regex, (_, json) => {
      data = JSON.parse(json);
      return "";
    });

    if (!data[this.prefix]) data[this.prefix] = {};

    if (typeof key === "object") {
      Object.assign(data[this.prefix], key);
    } else {
      data[this.prefix][key] = value;
    }

    body = `${body}\n\n<!-- probot = ${JSON.stringify(data)} -->`;

    const { owner, repo, number } = this.issue;
    return this.github.issues.edit({ owner, repo, number, body });
  }
}
