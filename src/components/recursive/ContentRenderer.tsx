import { baseUrl, cmsUrl, cn } from "@/lib/utils";

const ContentRenderer = ({ content }: { content: CMS_Content_RichText[] }) => {
  return content.map((node, i) => {
    if (node.type === "link") {
      return (
        <a
          key={node.url}
          href={node.url}
          target={node.newTab ? "_blank" : "_self"}
          className="text-blue-500"
        >
          <ContentRenderer content={node.children} />
        </a>
      );
    }

    if (node.type === "upload") {
      const url = node.value?.url as string;
      const isAbsoluteUrl = url?.startsWith('http://') || url?.startsWith('https://');
      const imageUrl = isAbsoluteUrl ? url : cmsUrl(url);
      
      return (
        <img
          key={`${node.value?.url}-${i}`}
          src={encodeURI(imageUrl)}
          alt={node.value?.alt}
          width={node.value?.width}
          height={node.value?.height}
          className="mx-auto"
        />
      );
    }
    if (node.type === "indent") {
      return (
        <div key={i} className="ml-6">
          <ContentRenderer content={node.children} key={i + "indent"} />
        </div>
      );
    }
    if (node.type === "h1") {
      return (
        <h1 key={i} className="text-4xl">
          <ContentRenderer content={node.children} key={i + "h1"} />
        </h1>
      );
    }
    if (node.type === "h2") {
      return (
        <h2 key={i} className="text-3xl ">
          <ContentRenderer content={node.children} key={i + "h2"} />
        </h2>
      );
    }
    if (node.type === "h3") {
      return (
        <h3 key={i} className="text-2xl ">
          <ContentRenderer content={node.children} key={i + "h3"} />
        </h3>
      );
    }
    if (node.type === "h4") {
      return (
        <h4 key={i} className="text-xl ">
          <ContentRenderer content={node.children} key={i + "h4"} />``
        </h4>
      );
    }
    if (node.type === "h5") {
      return (
        <h5 key={i} className="text-lg ">
          <ContentRenderer content={node.children} key={i + "h5"} />
        </h5>
      );
    }
    if (node.type === "h6") {
      return (
        <h6 key={i} className="text-base ">
          <ContentRenderer content={node.children} key={i + "h6"} />
        </h6>
      );
    }

    if (node.type === "ol") {
      return (
        <ol key={i} className="list-decimal mx-auto ">
          <ContentRenderer content={node.children} key={i + "ol"} />
        </ol>
      );
    }
    if (node.type === "ul") {
      return (
        <ul key={i} className="list-disc mx-auto ">
          <ContentRenderer content={node.children} key={i + "ul"} />
        </ul>
      );
    }

    if (node.type === "li") {
      return (
        <li key={i} className="list-disc">
          <ContentRenderer content={node.children} key={i + "li"} />
        </li>
      );
    }

    if (node.text === "") return <br key={i + "br"} />;

    if (node.text) {
      return (
        <span
          key={(node.text as string) + i}
          className={cn(
            node?.bold && "font-bold",
            node?.italic && "italic",
            node?.underline && "underline",
            node?.strikethrough && "line-through"
          )}
          dangerouslySetInnerHTML={{ __html: node.text }}
        ></span>
      );
    }

    if (node.children) {
      return <ContentRenderer content={node.children} key={i} />;
    }
  });
};

export default ContentRenderer;
