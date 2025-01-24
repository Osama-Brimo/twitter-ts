import { Control, ControllerRenderProps } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FormTextFieldProps extends React.ComponentProps<'input'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  formLabel: string;
  helperLabel?: string;
}

interface FormFieldRenderProps {
  field: ControllerRenderProps;
}

export default function FormTextField({
  type = 'text',
  control,
  name,
  helperLabel,
  formLabel,
  placeholder = 'Enter value',
  className,
}: FormTextFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: FormFieldRenderProps) => (
        <FormItem>
          <FormLabel>{formLabel}</FormLabel>
          <FormControl>
            <Input
              className={className}
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          {helperLabel ?? <FormDescription>{helperLabel}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// export default FormTextField;
