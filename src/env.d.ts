/// <reference types="astro/client" />



declare type CMS_JSONResponse<T> = {
    docs: T[];
};

declare type CMS_Tag = { id: number; name: string };
  
declare type CMS_Thumbnail = {
    id: number;
    url: string;
    width: number;
    height: number;
    alt: string | null
};

declare type CMS_Page = {
    id: number;
    tags: CMS_Tag[];
    title: string;
    subTitle: string;
    createdAt: Date;
    thumbnail: CMS_Thumbnail;
    content: CMS_Content_RichText[];
};

declare enum CMS_Content_RichText_Type {
    text = "text",
    link = "link",
    upload = "upload",
    indent = "indent",
    ul = "ul",
    li = "li",
    ol = "ol",
    h1 = "h1",
    h2 = "h2",
    h3 = "h3",
    h4 = "h4",
    h5 = "h5",
    h6 = "h6",
}

declare type CMS_Content_RichText = {
    text?: string;
    bold?: boolean;
    url?: string;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    type?: CMS_Content_RichText_Type;
    newTab?: boolean;
    children: CMS_Content_RichText[];
    value?: {
        url: string;
        width: number;
        height: number;
        alt?: string;
    }
    createdAt: Date;
};

declare type CMS_FAQ = {
    id: number;
    question: string;
    answer: string;
    createdAt: Date;
};