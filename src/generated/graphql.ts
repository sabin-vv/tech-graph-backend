import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }

export type Scalars = {
    ID: { input: string; output: string }
    String: { input: string; output: string }
    Boolean: { input: boolean; output: boolean }
    Int: { input: number; output: number }
    Float: { input: number; output: number }
    DateTime: { input: Date; output: Date }
}

export type Connection = {
    __typename?: 'Connection'
    createdAt: Scalars['DateTime']['output']
    id: Scalars['ID']['output']
    relation: Relation
    source: Knowledge
    target: Knowledge
    updatedAt: Scalars['DateTime']['output']
    userId: Scalars['ID']['output']
}

export type CreateConnectionInput = {
    relation: Relation
    sourceId: Scalars['ID']['input']
    targetId: Scalars['ID']['input']
    userId: Scalars['ID']['input']
}

export type CreateKnowledgeInput = {
    description: Scalars['String']['input']
    tags: Array<Scalars['String']['input']>
    title: Scalars['String']['input']
    type: KnowledgeType
    userId: Scalars['ID']['input']
}

export type Knowledge = {
    __typename?: 'Knowledge'
    createdAt: Scalars['DateTime']['output']
    description: Scalars['String']['output']
    id: Scalars['ID']['output']
    tags: Array<Scalars['String']['output']>
    title: Scalars['String']['output']
    type: KnowledgeType
    updatedAt: Scalars['DateTime']['output']
    user: User
}

export const KnowledgeType = {
    Algorithm: 'algorithm',
    Concept: 'concept',
    Database: 'database',
    Technology: 'technology',
} as const

export type KnowledgeType = (typeof KnowledgeType)[keyof typeof KnowledgeType]
export type Mutation = {
    __typename?: 'Mutation'
    createConnection: Connection
    createKnowledge: Knowledge
    deleteConnection: Scalars['Boolean']['output']
    deleteKnowledge: Scalars['Boolean']['output']
    updateConnection: Connection
    updateKnowledge: Knowledge
}

export type MutationCreateConnectionArgs = {
    input: CreateConnectionInput
}

export type MutationCreateKnowledgeArgs = {
    input: CreateKnowledgeInput
}

export type MutationDeleteConnectionArgs = {
    id: Scalars['ID']['input']
}

export type MutationDeleteKnowledgeArgs = {
    id: Scalars['ID']['input']
}

export type MutationUpdateConnectionArgs = {
    id: Scalars['ID']['input']
    input?: InputMaybe<UpdateConnectionInput>
}

export type MutationUpdateKnowledgeArgs = {
    id: Scalars['ID']['input']
    input: UpdateKnowledgeInput
}

export type Query = {
    __typename?: 'Query'
    connections: Array<Connection>
    connectionsByKnowledge: Array<Connection>
    knowledge: Array<Knowledge>
    knowledgeById?: Maybe<Knowledge>
}

export type QueryConnectionsByKnowledgeArgs = {
    id: Scalars['ID']['input']
}

export type QueryKnowledgeByIdArgs = {
    id: Scalars['ID']['input']
}

export const Relation = {
    BuiltWith: 'built_with',
    DependsOn: 'depends_on',
    Extends: 'extends',
    PartOf: 'part_of',
    RelatedTo: 'related_to',
    Uses: 'uses',
} as const

export type Relation = (typeof Relation)[keyof typeof Relation]
export type UpdateConnectionInput = {
    relation?: InputMaybe<Relation>
}

export type UpdateKnowledgeInput = {
    description?: InputMaybe<Scalars['String']['input']>
    tags?: InputMaybe<Array<Scalars['String']['input']>>
    title?: InputMaybe<Scalars['String']['input']>
    type?: InputMaybe<KnowledgeType>
}

export type User = {
    __typename?: 'User'
    email: Scalars['String']['output']
    id: Scalars['ID']['output']
    name: Scalars['String']['output']
}

export type WithIndex<TObject> = TObject & Record<string, any>
export type ResolversObject<TObject> = WithIndex<TObject>

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<
    TResult,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>
    resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
    | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
    | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<
    TResult,
    TKey extends string,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> =
    | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo,
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<
    TResult = Record<PropertyKey, never>,
    TParent = Record<PropertyKey, never>,
    TContext = Record<PropertyKey, never>,
    TArgs = Record<PropertyKey, never>,
> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export type ResolversTypes = ResolversObject<{
    Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>
    Connection: ResolverTypeWrapper<Connection>
    CreateConnectionInput: CreateConnectionInput
    CreateKnowledgeInput: CreateKnowledgeInput
    DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>
    ID: ResolverTypeWrapper<Scalars['ID']['output']>
    Knowledge: ResolverTypeWrapper<Knowledge>
    KnowledgeType: KnowledgeType
    Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>
    Query: ResolverTypeWrapper<Record<PropertyKey, never>>
    Relation: Relation
    String: ResolverTypeWrapper<Scalars['String']['output']>
    UpdateConnectionInput: UpdateConnectionInput
    UpdateKnowledgeInput: UpdateKnowledgeInput
    User: ResolverTypeWrapper<User>
}>

export type ResolversParentTypes = ResolversObject<{
    Boolean: Scalars['Boolean']['output']
    Connection: Connection
    CreateConnectionInput: CreateConnectionInput
    CreateKnowledgeInput: CreateKnowledgeInput
    DateTime: Scalars['DateTime']['output']
    ID: Scalars['ID']['output']
    Knowledge: Knowledge
    Mutation: Record<PropertyKey, never>
    Query: Record<PropertyKey, never>
    String: Scalars['String']['output']
    UpdateConnectionInput: UpdateConnectionInput
    UpdateKnowledgeInput: UpdateKnowledgeInput
    User: User
}>

export type ConnectionResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Connection'] = ResolversParentTypes['Connection'],
> = ResolversObject<{
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
    relation?: Resolver<ResolversTypes['Relation'], ParentType, ContextType>
    source?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType>
    target?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType>
    updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
}>

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
    name: 'DateTime'
}

export type KnowledgeResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Knowledge'] = ResolversParentTypes['Knowledge'],
> = ResolversObject<{
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
    tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>
    title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    type?: Resolver<ResolversTypes['KnowledgeType'], ParentType, ContextType>
    updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
    user?: Resolver<ResolversTypes['User'], ParentType, ContextType>
}>

export type MutationResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = ResolversObject<{
    createConnection?: Resolver<
        ResolversTypes['Connection'],
        ParentType,
        ContextType,
        RequireFields<MutationCreateConnectionArgs, 'input'>
    >
    createKnowledge?: Resolver<
        ResolversTypes['Knowledge'],
        ParentType,
        ContextType,
        RequireFields<MutationCreateKnowledgeArgs, 'input'>
    >
    deleteConnection?: Resolver<
        ResolversTypes['Boolean'],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteConnectionArgs, 'id'>
    >
    deleteKnowledge?: Resolver<
        ResolversTypes['Boolean'],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteKnowledgeArgs, 'id'>
    >
    updateConnection?: Resolver<
        ResolversTypes['Connection'],
        ParentType,
        ContextType,
        RequireFields<MutationUpdateConnectionArgs, 'id'>
    >
    updateKnowledge?: Resolver<
        ResolversTypes['Knowledge'],
        ParentType,
        ContextType,
        RequireFields<MutationUpdateKnowledgeArgs, 'id' | 'input'>
    >
}>

export type QueryResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = ResolversObject<{
    connections?: Resolver<Array<ResolversTypes['Connection']>, ParentType, ContextType>
    connectionsByKnowledge?: Resolver<
        Array<ResolversTypes['Connection']>,
        ParentType,
        ContextType,
        RequireFields<QueryConnectionsByKnowledgeArgs, 'id'>
    >
    knowledge?: Resolver<Array<ResolversTypes['Knowledge']>, ParentType, ContextType>
    knowledgeById?: Resolver<
        Maybe<ResolversTypes['Knowledge']>,
        ParentType,
        ContextType,
        RequireFields<QueryKnowledgeByIdArgs, 'id'>
    >
}>

export type UserResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = ResolversObject<{
    email?: Resolver<ResolversTypes['String'], ParentType, ContextType>
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}>

export type Resolvers<ContextType = any> = ResolversObject<{
    Connection?: ConnectionResolvers<ContextType>
    DateTime?: GraphQLScalarType
    Knowledge?: KnowledgeResolvers<ContextType>
    Mutation?: MutationResolvers<ContextType>
    Query?: QueryResolvers<ContextType>
    User?: UserResolvers<ContextType>
}>
