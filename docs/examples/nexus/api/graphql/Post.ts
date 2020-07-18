import { schema } from 'nexus'

schema.objectType({
  name: 'Post', // <- Name of your type
  definition(t) {
    t.int('id') // <- Field named `id` of type `Int`
    t.string('title') // <- Field named `title` of type `String`
    t.string('body') // <- Field named `body` of type `String`
    t.boolean('published') // <- Field named `published` of type `Boolean`
  },
})

schema.extendType({
  type: 'Query',
  definition(t) {
    t.field('drafts', {
      type: 'Post',
      list: true,
      resolve(_root, _args, ctx) {
        return ctx.db.post.findMany({ where: { published: false } })
      },
    })
    t.list.field('posts', {
      type: 'Post',
      resolve(_root, _args, ctx) {
        return ctx.db.post.findMany({ where: { published: true } })
      },
    })
  },
})

schema.extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createDraft', {
      type: 'Post',
      args: {
        title: schema.stringArg({ required: true }),
        body: schema.stringArg({ required: true }),
      },
      nullable: false,
      resolve(_root, args, ctx) {
        const draft = {
          title: args.title,
          body: args.body,
          published: false,
        }
        return ctx.db.post.create({ data: draft })
      },
    })
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: schema.intArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        return ctx.db.post.update({
          where: { id: args.draftId },
          data: {
            published: true,
          },
        })
      },
    })
  },
})
