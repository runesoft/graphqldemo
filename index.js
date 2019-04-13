const { ApolloServer, gql } = require("apollo-server");

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
`;

const resolvers = {
    Query: {
        hello: ()=>"asdf",
        me: () => user
    },
    Mutation: {
        me: (parent, args) => {
            console.log(args);
            if('mutation' in args){
                user.mutation = args.mutation;
            }
            return user;
        }
    }

};

const server = new ApolloServer({ typeDefs, resolvers});

server.listen().then(({url}) => console.log(url));