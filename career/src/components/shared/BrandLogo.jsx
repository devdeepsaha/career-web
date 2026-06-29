export default function BrandLogo({ className = 'h-8 w-auto' }) {
    return (
        <>
            <img
                src="/logo-dark.webp"
                alt="Potho Prodorshok logo"
                width="128"
                height="128"
                className={`block dark:hidden ${className}`}
            />
            <img
                src="/logo-light.webp"
                alt="Potho Prodorshok logo"
                width="128"
                height="128"
                className={`hidden dark:block ${className}`}
            />
        </>
    );
}
