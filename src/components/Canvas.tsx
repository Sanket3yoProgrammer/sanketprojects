import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { PlusCircle, X, GripVertical, Type, Image, Link, Video, Smile, Code, Heading, Space, Minus, AlertCircle, Quote, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import './Canvas.css';

export type BlockType = 'text' | 'image' | 'link' | 'video' | 'title' | 'code' | 'list';

// Export the CanvasBlock interface for use in other components
export interface CanvasBlock {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, any>;
}

interface CanvasProps {
  initialBlocks?: CanvasBlock[];
  onChange?: (blocks: CanvasBlock[]) => void;
  readOnly?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ 
  initialBlocks = [], 
  onChange,
  readOnly = false
}) => {
  const [blocks, setBlocks] = useState<CanvasBlock[]>(initialBlocks);

  useEffect(() => {
    if (initialBlocks.length > 0) {
      setBlocks(initialBlocks);
    }
  }, [initialBlocks]);

  useEffect(() => {
    if (onChange) {
      onChange(blocks);
    }
  }, [blocks, onChange]);

  const addBlock = (type: BlockType) => {
    const newBlock: CanvasBlock = { 
      id: `block-${Date.now()}`, 
      type, 
      content: '',
      metadata: {}
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const updateBlockMetadata = (id: string, metadata: Record<string, any>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, metadata: { ...block.metadata, ...metadata } } : block
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setBlocks(items);
  };

  const renderBlockContent = (block: CanvasBlock) => {
    if (readOnly) {
      return renderReadOnlyBlock(block);
    }

    switch (block.type) {
      case 'text':
        return (
          <Textarea
            className="w-full min-h-[100px] resize-y canvas-textarea"
            placeholder="Enter your text here..."
            value={block.content}
            onChange={(e) => updateBlockContent(block.id, e.target.value)}
          />
        );
      case 'title':
        return (
          <Input
            type="text"
            placeholder="Enter title text..."
            value={block.content}
            onChange={(e) => updateBlockContent(block.id, e.target.value)}
            className="canvas-input text-xl font-bold"
          />
        );
      case 'code':
        return (
          <div className="space-y-2">
            <Textarea
              className="w-full min-h-[150px] resize-y canvas-textarea font-mono"
              placeholder="Enter code here..."
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
            />
            <Input
              type="text"
              placeholder="Language (e.g., javascript, python, etc.)"
              value={block.metadata?.language || ''}
              onChange={(e) => updateBlockMetadata(block.id, { language: e.target.value })}
              className="canvas-input"
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Image URL"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              className="canvas-input"
            />
            <Input
              type="text"
              placeholder="Alt text"
              value={block.metadata?.alt || ''}
              onChange={(e) => updateBlockMetadata(block.id, { alt: e.target.value })}
              className="canvas-input"
            />
            {block.content && (
              <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                <img 
                  src={block.content} 
                  alt={block.metadata?.alt || 'Preview'} 
                  className="max-h-[200px] mx-auto object-contain"
                />
              </div>
            )}
          </div>
        );
      case 'link':
        return (
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="URL (https://...)"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              className="canvas-input"
            />
            <Input
              type="text"
              placeholder="Link text"
              value={block.metadata?.text || ''}
              onChange={(e) => updateBlockMetadata(block.id, { text: e.target.value })}
              className="canvas-input"
            />
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Video URL (YouTube, Vimeo, etc.)"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
              className="canvas-input"
            />
            {block.content && (
              <div className="mt-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                <iframe
                  src={block.content}
                  className="w-full aspect-video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        );
      case 'list':
        return (
          <div className="space-y-2">
            <Textarea
              className="w-full min-h-[100px] resize-y canvas-textarea"
              placeholder="Enter list items (one per line)"
              value={block.content}
              onChange={(e) => updateBlockContent(block.id, e.target.value)}
            />
            <div className="flex gap-2">
              <select
                value={block.metadata?.type || 'bullet'}
                onChange={(e) => updateBlockMetadata(block.id, { type: e.target.value })}
                className="canvas-input"
              >
                <option value="bullet">Bullet Points</option>
                <option value="number">Numbered List</option>
              </select>
            </div>
          </div>
        );
      default:
        return <div>Unsupported block type</div>;
    }
  };

  const renderReadOnlyBlock = (block: CanvasBlock) => {
    switch (block.type) {
      case 'text':
        return <div className="whitespace-pre-wrap">{block.content}</div>;
      case 'title':
        return <h2 className="text-2xl font-bold">{block.content}</h2>;
      case 'code':
        return (
          <div className="relative">
            <pre className={`language-${block.metadata?.language || 'text'} p-4 rounded-md bg-gray-800 text-gray-100 overflow-x-auto font-mono text-sm`}>
              <code>{block.content}</code>
            </pre>
          </div>
        );
      case 'image':
        return <img src={block.content} alt={block.metadata?.alt || ''} className="max-w-full" />;
      case 'link':
        return <a href={block.content} target="_blank" rel="noopener noreferrer">{block.metadata?.text || block.content}</a>;
      case 'video':
        return (
          <iframe
            src={block.content}
            className="w-full aspect-video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'list':
        const items = block.content.split('\n').filter(item => item.trim());
        const ListTag = block.metadata?.type === 'number' ? 'ol' : 'ul';
        return (
          <ListTag className={block.metadata?.type === 'number' ? 'list-decimal pl-6' : 'list-disc pl-6'}>
            {items.map((item, index) => (
              <li key={index} className="mb-1">{item}</li>
            ))}
          </ListTag>
        );
      default:
        return <div>Unsupported block type</div>;
    }
  };

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'text': return <Type size={16} />;
      case 'title': return <Heading size={16} />;
      case 'code': return <Code size={16} />;
      case 'image': return <Image size={16} />;
      case 'link': return <Link size={16} />;
      case 'video': return <Video size={16} />;
      case 'list': return <List size={16} />;
      default: return <Type size={16} />;
    }
  };

  return (
    <div className="canvas-container">
      {!readOnly && (
        <div className="canvas-toolbar mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="canvas-add-button">
                <PlusCircle size={16} className="mr-2" />
                Add Block
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="grid gap-1">
                <Button variant="ghost" onClick={() => addBlock('text')} className="justify-start">
                  <Type size={16} className="mr-2" /> Text
                </Button>
                <Button variant="ghost" onClick={() => addBlock('title')} className="justify-start">
                  <Heading size={16} className="mr-2" /> Title
                </Button>
                <Button variant="ghost" onClick={() => addBlock('code')} className="justify-start">
                  <Code size={16} className="mr-2" /> Code
                </Button>
                <Button variant="ghost" onClick={() => addBlock('image')} className="justify-start">
                  <Image size={16} className="mr-2" /> Image
                </Button>
                <Button variant="ghost" onClick={() => addBlock('link')} className="justify-start">
                  <Link size={16} className="mr-2" /> Link
                </Button>
                <Button variant="ghost" onClick={() => addBlock('video')} className="justify-start">
                  <Video size={16} className="mr-2" /> Video
                </Button>
                <Button variant="ghost" onClick={() => addBlock('list')} className="justify-start">
                  <List size={16} className="mr-2" /> List
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="canvas-blocks">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="canvas-blocks"
            >
              {blocks.length === 0 && !readOnly ? (
                <div className="canvas-empty-state">
                  <p>Add blocks to create your content</p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <Draggable
                    key={block.id}
                    draggableId={block.id}
                    index={index}
                    isDragDisabled={readOnly}
                  >
                    {(provided: DraggableProvided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="canvas-block mb-4"
                      >
                        {!readOnly && (
                          <div className="canvas-block-header">
                            <div 
                              {...provided.dragHandleProps}
                              className="canvas-block-drag-handle"
                            >
                              <GripVertical size={16} />
                            </div>
                            <div className="canvas-block-type">
                              {getBlockIcon(block.type)}
                              <span className="ml-1 text-xs">{block.type}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBlock(block.id)}
                              className="canvas-block-delete"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        )}
                        <CardContent className={readOnly ? '' : 'pt-2'}>
                          {renderBlockContent(block)}
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Canvas;