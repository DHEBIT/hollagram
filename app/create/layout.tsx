import { CreatePostProvider } from "./CreatePostContext";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <CreatePostProvider>{children}</CreatePostProvider>;
}