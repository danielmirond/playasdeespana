// src/components/seo/JsonLd.tsx
// Component to render JSON-LD structured data in <head>
// Use this in any page that needs schema.org markup

interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * For multiple schemas on one page
 * Example: BreadcrumbList + LocalBusiness + FAQPage
 */
interface MultiJsonLdProps {
  schemas: Record<string, any>[]
}

export function MultiJsonLd({ schemas }: MultiJsonLdProps) {
  return (
    <>
      {schemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
