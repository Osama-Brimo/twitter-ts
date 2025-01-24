import { ApolloContext } from '../context';
import { SearchableResolvers } from '../generated/graphql';

const SearchableResolvers: SearchableResolvers<ApolloContext> = {
    __resolveType(obj) {
        if (obj.type) return 'Post';
        if (obj.handle) return 'User';
        if (obj.hashtag) return 'Hashtag';
        return null;
    },
};

export default SearchableResolvers;