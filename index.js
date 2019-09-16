const { ApolloServer, gql, PubSub, withFilter } = require("apollo-server");
const {stories, features, epics} = require('./data.js');

const user = {
    name: "Bob",
    age:  22
};

const typeDefs = gql`
type Query{
    hello: String!
    me: User
    feature(id: ID): Feature
    story(id: ID): Story
    epic(id: ID): Epic
    workitems: [WorkItem]
}
enum Status{
    Refinement
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
    mutation: String
}
type Mutation {
        me(mutation: String!): User
        feature(id: ID!, status: Status): Feature
    }
type Subscription{
        mutated: User!
        feature(id: ID!): Feature
    }
`;

const MUTATED = 'MUTATED';
const pubsub = new PubSub();

const resolvers = {
    Query: {
        hello: ()=>"asdf",
        me: () => user,
        epic: (args,{id}) => {
            return epics.find(epic=>epic.id==id);
        },
        feature: (args,{id},s,w) => {
            console.log(w.fieldNodes[0].selectionSet.selections.map(c=>c.name.value));
            return features.find(f=>f.id==id);
        },
        story: (args,{id})=>{
            console.log(id);
            return stories.find(s=>s.id==id);
        },
        workitems: ()=>{
            return [...epics, ...features, ... stories];
        }
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
        __resolveType: (workitem)=>(!!workitem.featureid)?"Story":(!!workitem.epicid)?"Feature":"Epic"
    },
    Mutation: {
        me: (parent, {mutation},{pubsub}) => {
            user.mutation = mutation;
            pubsub.publish(MUTATED,{
                mutated: user
            });
            return user;
        },
        feature: (parent, {id, status},{pubsub}) => {
            let feature =features.find(f=>f.id==id)
            feature.status=status,
            pubsub.publish('feature',{
                feature: feature
            });
            return feature;
        }

    },
    Subscription: {
        mutated: {
            subscribe: (_,__,{pubsub})=>pubsub.asyncIterator(MUTATED)
        },
        feature: {
                subscribe: withFilter(
                     (_,__,{pubsub})=>pubsub.asyncIterator('feature'),
                     (payload,variables)=>payload.feature.id == variables.id)
            }
        
    }
};

const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({req,res}) => ({req,res, pubsub})
});

server.listen().then(({url}) => console.log(url));