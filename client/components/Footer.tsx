export default function Footer() {
    return (
        <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="font-semibold">About</h3>
                        <p className="text-sm text-gray-500">
                            A project for CMSC 137 demonstrating information retrieval concepts
                            using TF-IDF and cosine similarity.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>
                                <a href="/documentation" className="hover:text-gray-800">Documentation</a>
                            </li>
                            <li>
                                <a href="https://github.com/yourusername/your-repo" className="hover:text-gray-800">GitHub Repository</a>
                            </li>
                            <li>
                                <a href="/documentation#api" className="hover:text-gray-800">API Reference</a>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li>University of the Philippines</li>
                            <li>Department of Computer Science</li>
                            <li>CMSC 137 - Information Retrieval</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} CMSC 137 Project. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
} 