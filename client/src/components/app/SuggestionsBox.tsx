import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { type User as UserType } from '../../gql/graphql';
import UserCard from './UserCard';
interface SuggestionsBoxProps {
  items: UserType[];
}

const SuggestionsBox = ({ items }: SuggestionsBoxProps) => {
  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]"
    >
      <CommandList>
        <CommandGroup heading="Suggestions">
          {items?.map((item) => {
            return (
              <CommandItem>
                <UserCard user={item} />
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default SuggestionsBox;
