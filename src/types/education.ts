// Education types
export interface Course {
    id: number;
    title: string;
    slug: string;
    description: string;
    longDescription?: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    durationHours?: number;
    durationWeeks?: number;
    price: number;
    discountPrice?: number;
    thumbnailUrl?: string;
    videoUrl?: string;
    isFree: boolean;
    enrollmentCount: number;
    rating: number;
    ratingCount: number;
    instructorId?: number;
    instructor?: Instructor;
    modules?: CourseModule[];
    requirements?: string[];
    whatYouLearn?: string[];
}

export interface Instructor {
    id: number;
    name: string;
    title?: string;
    bio?: string;
    avatarUrl?: string;
    expertise?: string;
    rating?: number;
    studentsTaught?: number;
    coursesCount?: number;
}

export interface CourseModule {
    id: number;
    title: string;
    description?: string;
    durationMinutes?: number;
    isFree?: boolean;
}
