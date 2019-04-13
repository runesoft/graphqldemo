const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
type Query{
    hello: String!
    user: User
}
type User{
    name: String!
    age: Int!
}
`;

const resolvers = {
    Query: {
        hello: ()=>"asdf",
        user: () => ({
            name: "Someonse",
            age: 23 
        })
    }
};

const server = new ApolloServer({ typeDefs, resolvers});

server.listen().then(({url}) => console.log(url));