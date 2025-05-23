interface PartialLoaderOptions {
  id: string;
  url: string;
}

async function partialLoader({ id, url }: PartialLoaderOptions) {
  const component = document.getElementById(id);
  if (!component) return;

  const response = await fetch(url);
  const html = await response.text();
  component.innerHTML = html;
}

export default partialLoader;
