import React, {
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { Textarea } from '../ui/textarea';

interface RichTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxChars?: number;
}

interface TextTransform {
  pattern: RegExp;
  transform: (match: string, key: string) => React.ReactNode;
}

const RichTextArea = ({
  value,
  placeholder,
  onChange,
  maxChars,
}: RichTextAreaProps) => {
  // Make sure transformTextToElements always gets a string
  const text: string = useMemo(() => {
    const valType = typeof value;

    // if value is falsy and not number 0
    if (valType !== 'number' && !value) return '';

    switch (valType) {
      case 'string':
        return value as string;
      case 'number':
        return value?.toString();
      case 'object':
        return '';
      default:
        return '';
    }
  }, [value]);

  const transforms: TextTransform[] = useMemo(
    () => [
      {
        // Match @handle pattern (alphanumeric and dots, until space or end)
        pattern: /@([\w.]+)(?=\s|$)/g,
        transform: (match, key) => (
          <span
            key={key}
            // mention
            className=" text-blue-400 underline"
          >
            {match}
          </span>
        ),
      },
      {
        // Match #hashtag pattern (alphanumeric, until space or end)
        pattern: /#(\w+)(?=\s|$)/g,
        transform: (match, key) => (
          <span
            key={key}
            // hashtag
            className="bg-slate-200 text-slate-400"
          >
            {match}
          </span>
        ),
      },
      // Add overflow transform only if maxChars is provided
      ...(maxChars
        ? [
            {
              // Match all characters after maxChars
              pattern: new RegExp(`^.{${maxChars}}(.+)$`, 's'),
              transform: (match: string, key: string) => {
                const normalText = match.slice(0, maxChars);
                const overflowText = match.slice(maxChars);
                return (
                  <span key={key}>
                    {normalText}
                    <span className="bg-red-100 text-red-400">
                      {overflowText}
                    </span>
                  </span>
                );
              },
            },
          ]
        : []),
    ],
    [maxChars],
  );

  const transformTextToElements = useCallback(
    (text: string) => {
      if (typeof text !== 'string') return [];

      const elements: React.ReactNode[] = [];
      let currentText = text;
      let lastIndex = 0;

      while (currentText) {
        let earliestMatch: {
          transform: TextTransform;
          match: RegExpExecArray;
        } | null = null;

        // Find the earliest match among all transforms
        for (const transform of transforms) {
          transform.pattern.lastIndex = 0; // Reset the RegExp
          const match = transform.pattern.exec(currentText);
          if (
            match &&
            (!earliestMatch || match.index < earliestMatch.match.index)
          ) {
            earliestMatch = { transform, match };
          }
        }

        if (!earliestMatch) {
          // No more matches, add remaining text
          elements.push(currentText);
          break;
        }

        const { transform, match } = earliestMatch;
        const matchIndex = match.index;

        // Add text before the match
        if (matchIndex > 0) {
          elements.push(currentText.slice(0, matchIndex));
        }

        // Add the transformed element
        elements.push(
          transform.transform(match[0], `${match[0]}-${lastIndex}`),
        );

        // Update the remaining text and lastIndex
        currentText = currentText.slice(matchIndex + match[0].length);
        lastIndex++;
      }

      return elements;
    },
    [transforms],
  );

  const RichText = useMemo(
    () => transformTextToElements(text),
    [text, transformTextToElements],
  );

  useEffect(() => {
    console.log(
      'the elements getting put inside RichTextArea:',
      RichText,
      `The value:`,
      value,
      `The text:`,
      text,
    );
  }, [RichText, text, value]);

  // The actual element displaying the inputted text
  const StyledOverlay = () => (
    <div
      className="pointer-events-none absolute whitespace-pre-wrap break-words px-3 py-2 text-base md:text-sm h-32"
      style={{ inset: '-0.5px', overflow: 'hidden' }}
    >
      {RichText}
    </div>
  );

  // TODO: this should also receive media to display asthey are being uploaded as preview in a dynamic quilt

  return (
    <div className="relative">
      <Textarea
        id="content"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={{
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
          color: 'transparent',
          overflow: 'hidden',
        }}
        className="dark:caret-white caret-black resize-none border-0 shadow-none focus-visible:ring-0 h-32"
      />
      <StyledOverlay />
    </div>
  );
};

export default RichTextArea;
