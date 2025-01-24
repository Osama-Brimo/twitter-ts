import React, { ReactElement, useCallback } from 'react';
import RichHashtag from './RichHashtag';
import RichMention from './RichMention';

type RichTextMark = 'bold' | 'highlight' | 'link';

type RichTextSubstring = {
  value: string;
  color?: string;
  mark?: RichTextMark;
  highlightColor?: string;
  url?: string;
  wrapper?: ReactElement;
  caseSensitive?: boolean;
};

interface RichTextProps {
  content: string;
  substrings?: RichTextSubstring[];
}

const RichText = ({ content = '', substrings = [] }: RichTextProps) => {
  const chopText = useCallback(
    (text: string, substrings: RichTextSubstring[]): string[] => {
      let result: string[] = [text];

      substrings.forEach(({ value, caseSensitive = false }) => {
        result = result.flatMap((segment) => {
          const regex = new RegExp(value, caseSensitive ? 'g' : 'gi');
          const matches = Array.from(segment.matchAll(regex));

          if (matches.length === 0) return [segment];

          let lastIndex = 0;
          const parts: string[] = [];

          matches.forEach((match) => {
            if (match.index! > lastIndex) {
              parts.push(segment.slice(lastIndex, match.index));
            }
            parts.push(match[0]);
            lastIndex = match.index! + match[0].length;
          });

          if (lastIndex < segment.length) {
            parts.push(segment.slice(lastIndex));
          }

          return parts;
        });
      });

      return result.filter((segment) => segment.length > 0);
    },
    [],
  );

  const processContent = useCallback(() => {
    // First split by mentions and hashtags
    const mentionHashtagRegex = /(@[\w.]+|#\w+)/g;

    // Create an array of all segments, including matches
    let currentIndex = 0;
    const orderedSegments: string[] = [];
    const matches = Array.from(content.matchAll(mentionHashtagRegex));

    matches.forEach((match) => {
      // Add text before the match if it exists
      if (match.index! > currentIndex) {
        orderedSegments.push(content.slice(currentIndex, match.index));
      }
      // Add the match itself
      orderedSegments.push(match[0]);
      currentIndex = match.index! + match[0].length;
    });

    // Add remaining text after last match
    if (currentIndex < content.length) {
      orderedSegments.push(content.slice(currentIndex));
    }

    return orderedSegments.map((segment, index) => {
      const mentionMatch = segment.match(/^@([\w.]+)$/);
      const hashtagMatch = segment.match(/^#(\w+)$/);

      // Handle mentions and hashtags first
      if (mentionMatch) {
        return (
          <RichMention key={index} handle={mentionMatch[1]} />
        );
      }

      if (hashtagMatch) {
        return (
          <span key={index}>
            <RichHashtag key={index} hashtag={hashtagMatch[1]} content={segment} />
          </span>
        );
      }

      // For non-mention/hashtag segments, process substrings
      const processedSegments = chopText(segment, substrings);
      return processedSegments.map((subsegment, subIndex) => {
        const matchingSubstring = substrings.find((sub) => {
          if (sub.caseSensitive) {
            return sub.value === subsegment;
          }
          return sub.value.toLowerCase() === subsegment.toLowerCase();
        });

        if (!matchingSubstring) {
          return <span key={`${index}-${subIndex}`}>{subsegment}</span>;
        }

        if (matchingSubstring.wrapper) {
          const WrapperComponent = matchingSubstring.wrapper;
          return React.cloneElement(
            WrapperComponent,
            {
              key: `${index}-${subIndex}`,
            },
            subsegment,
          );
        }

        return (
          <span
            key={`${index}-${subIndex}`}
            style={{
              color: matchingSubstring.color,
              backgroundColor: matchingSubstring.highlightColor,
              fontWeight:
                matchingSubstring.mark === 'bold' ? 'bold' : undefined,
            }}
          >
            {matchingSubstring.mark === 'link' && matchingSubstring.url ? (
              <a href={matchingSubstring.url}>{subsegment}</a>
            ) : (
              subsegment
            )}
          </span>
        );
      });
    });
  }, [content, substrings, chopText]);

  return <>{processContent()}</>;
};

export default RichText;
