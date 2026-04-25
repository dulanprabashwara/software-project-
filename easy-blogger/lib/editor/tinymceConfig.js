export function getTinyMceConfig({
  fontSize = 16,
  placeholder = "Write your blog content here...",
} = {}) {
  return {
    readonly: false,
    promotion: false,

    // Auto-resize editor height based on written content
    min_height: 260,
    max_height: 900,
    autoresize_bottom_margin: 24,
    
    menubar: false,
    branding: false,
    placeholder,
    plugins: [
      "lists",
      "link",
      "image",
      "table",
      "code",
      "wordcount",
      "autolink",
      "autoresize",
    ],

    toolbar:
      "undo redo | blocks | bold italic underline | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist | link image table | code",

    forced_root_block: "p",
    forced_root_block_attrs: {
      dir: "ltr",
      style: "direction: ltr;",
    },

    content_style: `
      html, body {
        direction: ltr !important;
        unicode-bidi: embed !important;
        writing-mode: horizontal-tb !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: ${fontSize}px;
      }

      p, div, span, li, ul, ol, h1, h2, h3, h4, h5, h6 {
        direction: ltr !important;
        unicode-bidi: embed !important;
        writing-mode: horizontal-tb !important;
      }
    `,

    setup(editor) {
      const forceLtrOnly = () => {
        const body = editor.getBody();
        const doc = editor.getDoc();
        const html = doc?.documentElement;

        if (html) {
          html.setAttribute("dir", "ltr");
          html.style.direction = "ltr";
        }

        if (body) {
          body.setAttribute("dir", "ltr");
          body.style.direction = "ltr";
          body.style.unicodeBidi = "embed";
          body.style.writingMode = "horizontal-tb";
        }

        const blocks = body?.querySelectorAll(
          "p, div, span, li, ul, ol, h1, h2, h3, h4, h5, h6"
        );

        blocks?.forEach((node) => {
          node.setAttribute("dir", "ltr");
          node.style.direction = "ltr";
          node.style.unicodeBidi = "embed";
        });
      };

      editor.on("init", forceLtrOnly);
      editor.on("SetContent", forceLtrOnly);
    },
  };
}