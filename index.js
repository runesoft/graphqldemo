

const { ApolloServer, gql } = require("apollo-server");
const {stories, features, epics} = require('./data.js');

const typeDefs = gql`
type Query{
    hello: String!
    user: User
    feature(id: ID): Feature
    story(id: ID): Story
    epic(id: ID): Epic
}
enum Status{
    InProgress
    Done
    Accepted
}
interface WorkItem{
    title: String!
    status: Status!
}
type Story implements WorkItem{
    feature: Feature
    title: String!
    status: Status!
}
type Feature implements WorkItem{
    stories: [Story]
    title: String!
    status: Status!
    epic: Epic
}
type Epic  implements WorkItem{
    features: [Feature]
    title: String!
    status: Status!
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
        }),
        epic: (args,{id}) => {
            return epics.find(epic=>epic.id==id);
        },
        feature: (args,{id}) => {
            return features.find(f=>f.id==id);
        },
        story: (args,{id})=>{
            console.log(id);
            return stories.find(s=>s.id==id);
        },
    },
    Feature:{
        stories: (feature)=>{
            return stories.filter(s=>s.featureid===feature.id);
        },
        epic: (feature)=>{
            return epics.find(e=>e.id===feature.epicid);
        }
    },
    Story: {
        feature: (story)=>{return features.find(f=>f.id==story.featureid);}
    },
    Epic: {
        features: epic=>features.filter(feature=>feature.epicid==epic.id)
    },
    WorkItem: {
        title: ()=>"a work item",
        status: ()=>"Done"
    }
};

const server = new ApolloServer({ typeDefs, resolvers});

server.listen().then(({url}) => console.log(url));