<script>
    let { seoValue } = $props();
</script>

<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>{seoValue.title}</title>
<meta name="title" content={seoValue.title} />
<meta name="description" content={seoValue.description} />
<link rel="icon" href={seoValue.icon} />
<meta property="og:title" content={seoValue.title} />
<meta property="og:url" content={seoValue.url} />
<meta property="og:type" content="website" />
<meta property="og:description" content={seoValue.description} />
<meta property="og:image" content={seoValue.image} />

{#if seoValue.date}
    <meta name="date" content={seoValue.date} />
{/if}

{#if seoValue.published_time}
    <meta property="article:published_time" content={seoValue.published_time} />
{/if}

<meta name="naver-site-verification" content="69a089eebb7b97fc18466f32976c7bcc2ba4bf2d" />
