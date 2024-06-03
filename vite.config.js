export default {
    main: '/path/to/main.js', // The path should be relative to the project root
    build: {
        rollupOptions: {
            input: {
                main: '/main.js', // The path should be relative to the project root
                product: '/product.js',
                global: '/global.js',
                // Add more files as needed
            }
        }
    }
}