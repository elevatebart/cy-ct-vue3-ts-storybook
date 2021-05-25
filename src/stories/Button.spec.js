import { mount } from "@cypress/vue";
import * as Stories from "./Button.stories";
import { composeStories } from "../testing-vue";

const { Primary } = composeStories(Stories);

describe("<Button />", () => {
  it("playground", () => {
    mount(Primary());
  });
});
