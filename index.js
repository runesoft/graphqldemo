const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
type Query{
    hello: String!
    user: User
}
`;

const resolvers = {
    Query: {
        hello: ()=>"asdf",
    }
};

const server = new ApolloServer({ typeDefs, resolvers});

server.listen().then(({url}) => console.log(url));