interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700 font-medium leading-relaxed">{description}</p>
        </div>
    );
}