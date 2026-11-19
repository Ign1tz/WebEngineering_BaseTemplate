export interface Bear {
    id: string;
    name: string;
    binomial: string;
    range: string;
    image: string;
}

export interface CommentInput {
    author: string;
    text: string;
}

export interface Comment extends CommentInput {
    id: string;
    bearId: string | null;
}

export interface BearRepository {
    list(): Promise<Bear[]>;
    findById(id: string): Promise<Bear | undefined>;
}

export interface CommentRepository {
    list(bearId: string | null): Promise<Comment[]>;
    findById(id: string): Promise<Comment | undefined>;
    create(bearId: string | null, input: CommentInput): Promise<Comment>;
    delete(id: string): Promise<boolean>;
}

export interface Repositories {
    bears: BearRepository;
    comments: CommentRepository;
}