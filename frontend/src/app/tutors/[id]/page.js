import TutorProfileView from '@/components/tutor/TutorProfileView';

export default async function TutorPage({ params }) {
    // Await params because in newer Next.js versions params is a promise
    const { id } = await params;
    return <TutorProfileView tutorId={id} />;
}
