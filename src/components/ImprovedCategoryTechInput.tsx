/**
 * Improved Category and Tech Stack Inputs
 * Provides dropdown + custom input capability
 */

import React, { useState, useRef, useEffect } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Plus, ChevronDown, Check } from 'lucide-react';
import { ProjectCategory } from '../types/project';

// Expanded category list
export const EXTENDED_CATEGORIES = [
  { value: 'web-app', label: 'Web Application', icon: '🌐' },
  { value: 'mobile-app', label: 'Mobile App', icon: '📱' },
  { value: 'api', label: 'API/Backend', icon: '⚡' },
  { value: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { value: 'library', label: 'Library/Package', icon: '📦' },
  { value: 'game', label: 'Game', icon: '🎮' },
  { value: 'blockchain', label: 'Web3/Blockchain', icon: '⛓️' },
  { value: 'desktop', label: 'Desktop App', icon: '🖥️' },
  { value: 'cli', label: 'CLI Tool', icon: '⌨️' },
  { value: 'extension', label: 'Browser Extension', icon: '🧩' },
  { value: 'devops', label: 'DevOps/Infrastructure', icon: '🔧' },
  { value: 'data-science', label: 'Data Science', icon: '📊' },
  { value: 'iot', label: 'IoT', icon: '📡' },
  { value: 'learning', label: 'Learning Project', icon: '📚' },
  { value: 'other', label: 'Other', icon: '🔨' }
];

// Comprehensive tech stack options
export const TECH_STACK_OPTIONS = [
  // Frontend Frameworks
  'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
  // Backend Frameworks
  'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails',
  'Spring Boot', 'ASP.NET', 'Laravel', 'Phoenix',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic', 'Xamarin',
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP',
  'Ruby', 'Dart', 'Swift', 'Kotlin', 'C++', 'Elixir',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase',
  'DynamoDB', 'Cassandra', 'Neo4j', 'CouchDB',
  // Cloud & DevOps
  'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Heroku', 'Docker',
  'Kubernetes', 'Jenkins', 'GitHub Actions', 'CircleCI',
  // Styling
  'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Ant Design',
  'Styled Components', 'Sass', 'CSS Modules',
  // State Management
  'Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'Context API',
  // Testing
  'Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library',
  // Build Tools
  'Vite', 'Webpack', 'Rollup', 'Parcel', 'Turbopack',
  // APIs & GraphQL
  'REST API', 'GraphQL', 'tRPC', 'Apollo', 'Prisma',
  // AI/ML
  'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'Hugging Face',
  // Blockchain
  'Solidity', 'Ethereum', 'Web3.js', 'Hardhat', 'Truffle',
  // Version Control
  'Git', 'GitHub', 'GitLab', 'Bitbucket'
];

interface CategorySelectorProps {
  value: ProjectCategory | string;
  onChange: (value: ProjectCategory | string) => void;
  allowCustom?: boolean;
}

export function CategorySelector({ value, onChange, allowCustom = true }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = EXTENDED_CATEGORIES.find(cat => cat.value === value);
  const isCustomCategory = !selectedCategory && value;

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onChange(customInput.trim());
      setCustomInput('');
      setShowCustomInput(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-foreground text-base">Category *</Label>
      
      {/* Main Dropdown Button - More beautiful */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 border-2 border-border rounded-lg bg-background text-left flex items-center justify-between hover:border-primary/50 hover:bg-accent/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <div className="flex items-center gap-3">
            {selectedCategory ? (
              <>
                <span className="text-2xl">{selectedCategory.icon}</span>
                <span className="text-foreground">{selectedCategory.label}</span>
              </>
            ) : isCustomCategory ? (
              <>
                <span className="text-2xl">🔨</span>
                <span className="text-foreground">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Choose a category...</span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu - More beautiful with animation */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-border rounded-xl shadow-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Predefined Categories */}
            <div className="p-3">
              <div className="grid grid-cols-1 gap-1">
                {EXTENDED_CATEGORIES.map(category => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => {
                      onChange(category.value);
                      setIsOpen(false);
                      setShowCustomInput(false);
                    }}
                    className={`p-3 rounded-lg text-left flex items-center gap-3 transition-all duration-150 ${
                      value === category.value
                        ? 'bg-primary/10 text-primary shadow-sm scale-[0.98]'
                        : 'hover:bg-gray-100 text-gray-900 hover:scale-[0.98]'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="flex-1">{category.label}</span>
                    {value === category.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Category Option */}
              {allowCustom && (
                <>
                  <div className="my-2 border-t border-gray-200" />
                  {!showCustomInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="w-full p-3 rounded-lg text-left flex items-center gap-3 hover:bg-blue-50 text-blue-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add custom category...</span>
                    </button>
                  ) : (
                    <div className="p-3 space-y-3 bg-gray-50 rounded-lg">
                      <Input
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Type your custom category"
                        className="bg-white border-2"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCustomSubmit();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCustomSubmit}
                          disabled={!customInput.trim()}
                          className="flex-1"
                        >
                          Add Category
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomInput('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TechStackSelectorProps {
  selectedTech: string[];
  onAdd: (tech: string) => void;
  onRemove: (tech: string) => void;
}

export function TechStackSelector({ selectedTech, onAdd, onRemove }: TechStackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTechOptions = TECH_STACK_OPTIONS.filter(tech =>
    !selectedTech.includes(tech) &&
    tech.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTech = (tech: string) => {
    onAdd(tech);
    setSearchQuery('');
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selectedTech.includes(trimmed)) {
      onAdd(trimmed);
      setCustomInput('');
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-foreground text-base">Tech Stack</Label>

      {/* Dropdown Input - More beautiful */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search technologies (React, Node.js, Python...)"
              className="bg-input-background border-2 border-border h-12 text-base focus:border-primary/50 transition-all"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="border-2 border-border h-12 px-3 hover:bg-accent/20"
          >
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Dropdown List - More beautiful with animation */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-border rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 space-y-1">
              {/* If search query doesn't match any option, allow adding it */}
              {searchQuery.trim() && !TECH_STACK_OPTIONS.some(opt => 
                opt.toLowerCase() === searchQuery.toLowerCase()
              ) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddTech(searchQuery.trim());
                      setIsOpen(false);
                    }}
                    className="w-full p-3 rounded-lg text-left flex items-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border-2 border-blue-200 transition-all hover:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5" />
                    <div>
                      <div>Add "{searchQuery}"</div>
                      <div className="text-xs text-blue-600">Custom technology</div>
                    </div>
                  </button>
                  <div className="my-2 border-t border-gray-200" />
                </>
              )}

              {/* Existing Options */}
              {filteredTechOptions.length > 0 ? (
                filteredTechOptions.slice(0, 20).map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      handleAddTech(tech);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 rounded-lg text-left hover:bg-gray-100 text-gray-900 transition-all hover:scale-[0.98]"
                  >
                    {tech}
                  </button>
                ))
              ) : searchQuery.trim() ? null : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  💡 Start typing to search technologies...
                </div>
              )}

              {/* Show count if there are more results */}
              {filteredTechOptions.length > 20 && (
                <div className="p-2 text-center text-xs text-muted-foreground">
                  +{filteredTechOptions.length - 20} more options...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Suggestions - More beautiful */}
      {!searchQuery && selectedTech.length === 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Popular technologies:</div>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK_OPTIONS.filter(tech => 
              !selectedTech.includes(tech)
            ).slice(0, 10).map(tech => (
              <button
                key={tech}
                type="button"
                onClick={() => handleAddTech(tech)}
                className="px-3 py-1.5 text-sm border-2 border-border rounded-lg bg-background text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-accent/20 transition-all"
              >
                + {tech}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Technologies - More beautiful badges */}
      {selectedTech.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {selectedTech.length} technolog{selectedTech.length === 1 ? 'y' : 'ies'} selected
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTech.map(tech => (
              <Badge
                key={tech}
                className="flex items-center gap-2 bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm hover:bg-primary/20 transition-colors"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => onRemove(tech)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
