# Contributing Guide

You want to contribute to Prisma-multi-tenant? Awesome! 😎

Here are the steps to contribute:

1. [Finding an issue to work on](#1-finding-an-issue-to-work-on)
2. [Cloning and installing Prisma-multi-tenant](#2-cloning-and-installing-prisma-multi-tenant)
3. [Running and linking Prisma-multi-tenant](#3-running-and-linking-prisma-multi-tenant)
4. [Creating the Pull Request](#4-creating-the-pull-request)

## 1. Finding an issue to work on

Building Open Source projects is a collaborative process. Features and bug requests are discussed with maintainers and users to find the best solution to the problems at hand.

If you want to work on [an already existing issue](https://github.com/Errorname/prisma-multi-tenant/issues), **add a comment saying you are working on it**. Otherwise, there may be multiple people working on the same issue.

If you want to work on something else, please **create an issue explaining what you want to do**. People will then be able to give you some ideas or context to help you.

> Note: Want to contribute but don't know where to start? Send me a message on [Prisma's Slack](https://slack.prisma.io/) (@Errorname)!

## 2. Cloning and bootstrapping Prisma-multi-tenant

Once you have an issue, you can clone and bootstrap Prisma-multi-tenant:

```sh
git clone https://github.com/Errorname/prisma-multi-tenant.git
npm run bootstrap # There may be a few warnings/errors
```

## 3. Running Prisma-multi-tenant

Prisma-multi-tenant is a mono-repository hosting multiple packages:

Main packages:

- `prisma-multi-tenant` found in `/packages/cli`
- `@prisma-multi-tenant/client` found in `/packages/client`
- `@prisma-multi-tenant/shared` found in `/packages/shared`

Integrations packages:

- `@prisma-multi-tenant/blitz` found in `/packages/blitz`
- `@prisma-multi-tenant/redwood` found in `/packages/redwood`

Those packages are written in Typescript. For each one of those package, you will need to build it with the following command:

```sh
cd packages/shared
npm run build -- -w

cd packages/cli
npm run build -- -w

cd packages/client
npm run build -- -w

# etc...
```

Now, whenever you use the command `prisma-multi-tenant` or `pmt`, it will use your local version.

> Note: PMT uses npm workspaces, available from npm@7+. Make sure your npm version is up-to-date

You can now work on your issue! 🥳

## 4. Creating the Pull Request

Your contribution is working beyond expectation? Great, let's add it to the project!

But first, let's make sure your code is correctly formatted, and doesn't introduce regressions:

```sh
# At the root of prisma-multi-tenant
npm run check
```

Everything's green? Perfect!

> Note: If you are contributing on some documention, please use the [Prisma's documentation style guide](https://www.prisma.io/more/style-guide)

You can now [create a Pull Request](https://github.com/Errorname/prisma-multi-tenant/compare), link to the issue, and explain what your contribution does.

Thank you for taking the time to improve this project 🙂
