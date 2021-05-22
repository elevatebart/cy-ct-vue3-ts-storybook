import type { ConcreteComponent, Component, ComponentOptions } from "vue";
import { h } from "vue";
import {
  StoryFn,
  DecoratorFunction,
  StoryContext,
  LegacyStoryFn,
} from "@storybook/addons";

type StoryFnVueReturnType = ConcreteComponent<any>;

/*
  This normalizes a functional component into a render method in ComponentOptions.

  The concept is taken from Vue 3's `defineComponent` but changed from creating a `setup`
  method on the ComponentOptions so end-users don't need to specify a "thunk" as a decorator.
 */
function normalizeFunctionalComponent(
  options: ConcreteComponent
): ComponentOptions {
  return typeof options === "function"
    ? { render: options, name: options.name }
    : options;
}

function prepare(
  rawStory: StoryFnVueReturnType,
  innerStory?: ConcreteComponent
): Component {
  const story = rawStory as ComponentOptions;

  if (innerStory) {
    return {
      // Normalize so we can always spread an object
      ...normalizeFunctionalComponent(story),
      components: { ...(story.components || {}), story: innerStory },
    };
  }

  return {
    render() {
      return h(story);
    },
  };
}

const defaultContext: StoryContext = {
  id: "unspecified",
  name: "unspecified",
  kind: "unspecified",
  parameters: {},
  args: {},
  argTypes: {},
  globals: {},
};

export default function decorateStory(
  storyFn: StoryFn<StoryFnVueReturnType>,
  decorators: DecoratorFunction<ConcreteComponent>[]
): StoryFn<Component> {
  let finalDecoratedStory: LegacyStoryFn<Component> = (context) =>
    prepare(storyFn(context));

  decorators.forEach((decorator) => {
    finalDecoratedStory = (context: StoryContext = defaultContext) => {
      let story: StoryFn<Component>;

      const decoratedStory = decorator(
        ({ parameters, ...innerContext } = {} as StoryContext) =>
          // @ts-ignore
          finalDecoratedStory({ ...context, ...innerContext }),
        context
      );

      // @ts-ignore
      return prepare(decoratedStory, story);
    };
  });
  return finalDecoratedStory;
}
