<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the supplied OtimizaHub HTML composition and compiled legacy stylesheet as source content, layering scoped CSS overrides in `src/styles.css`; this preserves the original copy, pricing, and interactive sections while making requested refinements isolated.
- Mount the final contact globe as a React Three Fiber portal on a client-only home route; this avoids external CDN scripts and keeps the original page HTML static.
