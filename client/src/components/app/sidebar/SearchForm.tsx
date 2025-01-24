import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { searchSchema } from '../../../lib/zod';
import {  useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import FormTextField from '../../form/FormTextField';
import { Form } from '../../ui/form';

function SearchForm() {
  type SearchFormValues = z.infer<typeof searchSchema>;

  const navigate = useNavigate();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      q: '',
    },
  });

  const onSubmit = (values: SearchFormValues) => {
    navigate(`/search?q=${values.q}`);
  };

  return (
    <Form {...form}>
      <form
        className="relative ml-auto md:grow-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <FormTextField
            control={form.control}
            placeholder="Search..."
            name="q"
            type="text"
            classname="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
          {/* <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          /> */}
        </div>
      </form>
    </Form>
  );
}

export default SearchForm;
