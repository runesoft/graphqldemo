const { ApolloServer, gql, PubSub } = require("apollo-server");

const user = {
    name: "Bob",
    age:  22
};

const typeDefs = gql`
type Query{
    hello: String!
    me: User
}
type User{
    name: String!
    age: Int!
    mutation: String
}
type Mutation {
        me(mutation: String!): User
    }
    type Subscription{
        mutated: User!
    }
`;

const MUTATED = 'MUTATED';
const pubsub = new PubSub();

const resolvers = {
    Query: {
        hello: ()=>"asdf",
        me: () => user
    },
    Mutation: {
        me: (parent, {mutation},{pubsub}) => {
            user.mutation = mutation;
            pubsub.publish(MUTATED,{
                mutated: user
            });
            return user;
        }
    },
    Subscription: {
        mutated: {
            subscribe: (_,__,{pubsub})=>pubsub.asyncIterator(MUTATED)
        }
    }
};

const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({req,res}) => ({req,res, pubsub})
});

server.listen().then(({url}) => console.log(url));