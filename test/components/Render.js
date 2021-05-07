import React from "react";

import { renderMdast } from "mdast-react-render";
import visit from "unist-util-visit";
import { ColorContextProvider } from "@project-r/styleguide";

const Render = ({ mdast, schema }) => {
  const jsUrl = require("file-loader!../../build/index.js");

  visit(mdast, "zone", (node) => {
    if (
      node.identifier === "DYNAMIC_COMPONENT" &&
      node.data.src.match(/dynamic-components\/[^\/]+\/index\.js/)
    ) {
      node.data.src = "/build/index.js" + "?u=" + encodeURIComponent(jsUrl);
    }
  });

  return (
    <ColorContextProvider root colorSchemeKey="auto">
      <div key={jsUrl}>{renderMdast(mdast, schema)}</div>
    </ColorContextProvider>
  );
};

export default Render;
