import { Loader2 } from 'lucide-react';
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from '@/components/ui/button';
import React from 'react';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { TooltipPortal } from '@radix-ui/react-tooltip';

export interface ButtonProps extends ShadcnButtonProps {
  loading?: boolean;
  loadingLabel?: string;
  content?: string;
  tooltip?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, loadingLabel, content, tooltip, ...props }, ref) => {
    if (loading) {
      return (
        <ShadcnButton {...props} ref={ref} disabled>
          <Loader2 className="animate-spin" />
          {loadingLabel}
        </ShadcnButton>
      );
    }

    return (
      // <TooltipProvider>
      //   <Tooltip>
      //     <TooltipTrigger asChild>
      //       <ShadcnButton {...props} ref={ref}>
      //         {props.children}
      //         {content}
      //       </ShadcnButton>
      //     </TooltipTrigger>
      //     {tooltip && (
      //       <TooltipPortal>
      //         <TooltipContent>
      //           <p>{tooltip}</p>
      //         </TooltipContent>
      //       </TooltipPortal>
      //     )}
      //   </Tooltip>
      // </TooltipProvider>
      <ShadcnButton {...props} ref={ref}>
        {props.children}
        {content}
      </ShadcnButton>
    );
  },
);

export default Button;
