import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '../ui/button'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Undo,
    Redo
} from 'lucide-react'

interface EditorProps {
    content: string
    onChange: (content: string) => void
}

const Editor = ({ content, onChange }: EditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        immediatelyRender: false,
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border rounded-md overflow-hidden bg-background">
            <div className="flex flex-wrap gap-1 p-2 bg-muted/50 border-b">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : ''}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : ''}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : ''}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            <div className="p-4 min-h-[300px] focus-within:outline-none tiptap-editor">
                <EditorContent editor={editor} />
            </div>
            <style>{`
                .tiptap-editor .tiptap {
                    outline: none;
                    min-height: 300px;
                }
                .tiptap-editor h1 { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
                .tiptap-editor h2 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
                .tiptap-editor p { margin-bottom: 0.5rem; }
                .tiptap-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
                .tiptap-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
            `}</style>
        </div>
    )
}

export default Editor
