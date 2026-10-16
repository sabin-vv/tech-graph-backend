import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type AvatarUploadUrlPayload = {
  __typename?: 'AvatarUploadUrlPayload';
  contentType: Scalars['String']['output'];
  expiresIn: Scalars['Int']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type Connection = {
  __typename?: 'Connection';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  relation: Relation;
  source: Knowledge;
  target: Knowledge;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type CreateAvatarUploadUrlInput = {
  contentType: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};

export type CreateConnectionInput = {
  relation: Relation;
  sourceId: Scalars['ID']['input'];
  targetId: Scalars['ID']['input'];
};

export type CreateKnowledgeInput = {
  description: Scalars['String']['input'];
  tags: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type: KnowledgeType;
};

export type CreateResourceInput = {
  description: Scalars['String']['input'];
  knowledgeId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  type: ResourceType;
  url: Scalars['String']['input'];
};

export type Knowledge = {
  __typename?: 'Knowledge';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: KnowledgeType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export const KnowledgeType = {
  Algorithm: 'algorithm',
  Concept: 'concept',
  Database: 'database',
  Technology: 'technology'
} as const;

export type KnowledgeType = typeof KnowledgeType[keyof typeof KnowledgeType];
export type Mutation = {
  __typename?: 'Mutation';
  confirmAvatarUpload: User;
  createAvatarUploadUrl: AvatarUploadUrlPayload;
  createConnection: Connection;
  createKnowledge: Knowledge;
  createResource: Resource;
  deleteConnection: Scalars['Boolean']['output'];
  deleteKnowledge: Scalars['Boolean']['output'];
  deleteResource: Scalars['Boolean']['output'];
  login: AuthPayload;
  signup: AuthPayload;
  updateConnection: Connection;
  updateKnowledge: Knowledge;
  updateProfile: User;
  updateResource: Resource;
};


export type MutationCreateAvatarUploadUrlArgs = {
  input: CreateAvatarUploadUrlInput;
};


export type MutationCreateConnectionArgs = {
  input: CreateConnectionInput;
};


export type MutationCreateKnowledgeArgs = {
  input: CreateKnowledgeInput;
};


export type MutationCreateResourceArgs = {
  input: CreateResourceInput;
};


export type MutationDeleteConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteKnowledgeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteResourceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateConnectionArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<UpdateConnectionInput>;
};


export type MutationUpdateKnowledgeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateKnowledgeInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateResourceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateResourceInput;
};

export type Query = {
  __typename?: 'Query';
  connections: Array<Connection>;
  connectionsByKnowledge: Array<Connection>;
  knowledge: Array<Knowledge>;
  knowledgeById?: Maybe<Knowledge>;
  me?: Maybe<User>;
  resources: Array<Resource>;
  resourcesByKnowledge: Array<Resource>;
};


export type QueryConnectionsByKnowledgeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryKnowledgeByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryResourcesByKnowledgeArgs = {
  id: Scalars['ID']['input'];
};

export const Relation = {
  BuiltWith: 'built_with',
  DependsOn: 'depends_on',
  Extends: 'extends',
  PartOf: 'part_of',
  RelatedTo: 'related_to',
  Uses: 'uses'
} as const;

export type Relation = typeof Relation[keyof typeof Relation];
export type Resource = {
  __typename?: 'Resource';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  knowledge: Knowledge;
  knowledgeId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: ResourceType;
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export const ResourceType = {
  Article: 'article',
  Course: 'course',
  Documentation: 'documentation',
  Github: 'github',
  Other: 'other',
  Video: 'video'
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];
export type SignupInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type UpdateConnectionInput = {
  relation?: InputMaybe<Relation>;
};

export type UpdateKnowledgeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<KnowledgeType>;
};

export type UpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateResourceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ResourceType>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  jobTitle?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  skills: Array<Scalars['String']['output']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  AvatarUploadUrlPayload: ResolverTypeWrapper<AvatarUploadUrlPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Connection: ResolverTypeWrapper<Connection>;
  CreateAvatarUploadUrlInput: CreateAvatarUploadUrlInput;
  CreateConnectionInput: CreateConnectionInput;
  CreateKnowledgeInput: CreateKnowledgeInput;
  CreateResourceInput: CreateResourceInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Knowledge: ResolverTypeWrapper<Knowledge>;
  KnowledgeType: KnowledgeType;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Relation: Relation;
  Resource: ResolverTypeWrapper<Resource>;
  ResourceType: ResourceType;
  SignupInput: SignupInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateConnectionInput: UpdateConnectionInput;
  UpdateKnowledgeInput: UpdateKnowledgeInput;
  UpdateProfileInput: UpdateProfileInput;
  UpdateResourceInput: UpdateResourceInput;
  User: ResolverTypeWrapper<User>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuthPayload: AuthPayload;
  AvatarUploadUrlPayload: AvatarUploadUrlPayload;
  Boolean: Scalars['Boolean']['output'];
  Connection: Connection;
  CreateAvatarUploadUrlInput: CreateAvatarUploadUrlInput;
  CreateConnectionInput: CreateConnectionInput;
  CreateKnowledgeInput: CreateKnowledgeInput;
  CreateResourceInput: CreateResourceInput;
  DateTime: Scalars['DateTime']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Knowledge: Knowledge;
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  Resource: Resource;
  SignupInput: SignupInput;
  String: Scalars['String']['output'];
  UpdateConnectionInput: UpdateConnectionInput;
  UpdateKnowledgeInput: UpdateKnowledgeInput;
  UpdateProfileInput: UpdateProfileInput;
  UpdateResourceInput: UpdateResourceInput;
  User: User;
}>;

export type AuthPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type AvatarUploadUrlPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AvatarUploadUrlPayload'] = ResolversParentTypes['AvatarUploadUrlPayload']> = ResolversObject<{
  contentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresIn?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  uploadUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type ConnectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Connection'] = ResolversParentTypes['Connection']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  relation?: Resolver<ResolversTypes['Relation'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type KnowledgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Knowledge'] = ResolversParentTypes['Knowledge']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['KnowledgeType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  confirmAvatarUpload?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createAvatarUploadUrl?: Resolver<ResolversTypes['AvatarUploadUrlPayload'], ParentType, ContextType, RequireFields<MutationCreateAvatarUploadUrlArgs, 'input'>>;
  createConnection?: Resolver<ResolversTypes['Connection'], ParentType, ContextType, RequireFields<MutationCreateConnectionArgs, 'input'>>;
  createKnowledge?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType, RequireFields<MutationCreateKnowledgeArgs, 'input'>>;
  createResource?: Resolver<ResolversTypes['Resource'], ParentType, ContextType, RequireFields<MutationCreateResourceArgs, 'input'>>;
  deleteConnection?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteConnectionArgs, 'id'>>;
  deleteKnowledge?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteKnowledgeArgs, 'id'>>;
  deleteResource?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteResourceArgs, 'id'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  signup?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  updateConnection?: Resolver<ResolversTypes['Connection'], ParentType, ContextType, RequireFields<MutationUpdateConnectionArgs, 'id'>>;
  updateKnowledge?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType, RequireFields<MutationUpdateKnowledgeArgs, 'id' | 'input'>>;
  updateProfile?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  updateResource?: Resolver<ResolversTypes['Resource'], ParentType, ContextType, RequireFields<MutationUpdateResourceArgs, 'id' | 'input'>>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  connections?: Resolver<Array<ResolversTypes['Connection']>, ParentType, ContextType>;
  connectionsByKnowledge?: Resolver<Array<ResolversTypes['Connection']>, ParentType, ContextType, RequireFields<QueryConnectionsByKnowledgeArgs, 'id'>>;
  knowledge?: Resolver<Array<ResolversTypes['Knowledge']>, ParentType, ContextType>;
  knowledgeById?: Resolver<Maybe<ResolversTypes['Knowledge']>, ParentType, ContextType, RequireFields<QueryKnowledgeByIdArgs, 'id'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  resources?: Resolver<Array<ResolversTypes['Resource']>, ParentType, ContextType>;
  resourcesByKnowledge?: Resolver<Array<ResolversTypes['Resource']>, ParentType, ContextType, RequireFields<QueryResourcesByKnowledgeArgs, 'id'>>;
}>;

export type ResourceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Resource'] = ResolversParentTypes['Resource']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  knowledge?: Resolver<ResolversTypes['Knowledge'], ParentType, ContextType>;
  knowledgeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ResourceType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  jobTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  skills?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  AvatarUploadUrlPayload?: AvatarUploadUrlPayloadResolvers<ContextType>;
  Connection?: ConnectionResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Knowledge?: KnowledgeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Resource?: ResourceResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

