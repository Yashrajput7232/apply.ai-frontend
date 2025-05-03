'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card"; // Added Card for consistency
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';

// Define interfaces based on services (or merge into a single Job type)
interface JobListing {
  title: string;
  company: string;
  location: string;
  link: string;
  shortDescription: string;
  source: 'LinkedIn' | 'Indeed'; // Added source to differentiate
}

// Mock scraping functions - replace with actual API calls
async function fetchMockLinkedInJobs(searchTerm: string, location: string): Promise<JobListing[]> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  const mockData: JobListing[] = [
    { title: 'Software Engineer', company: 'Tech Innovations Inc.', location: 'San Francisco, CA', link: '#', shortDescription: 'Developing cutting-edge software solutions.', source: 'LinkedIn' },
    { title: 'Frontend Developer', company: 'Web Wizards Co.', location: 'New York, NY', link: '#', shortDescription: 'Building responsive and interactive user interfaces.', source: 'LinkedIn' },
    { title: 'Backend Engineer', company: 'Data Dynamics Ltd.', location: 'Austin, TX', link: '#', shortDescription: 'Designing and maintaining scalable server-side logic.', source: 'LinkedIn' },
     { title: 'Product Manager', company: 'Creative Solutions', location: 'San Francisco, CA', link: '#', shortDescription: 'Leading product strategy and development lifecycle.', source: 'LinkedIn' },
  ];
  return mockData.filter(job =>
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (location === '' || job.location.toLowerCase().includes(location.toLowerCase()))
  );
}

async function fetchMockIndeedJobs(searchTerm: string, location: string): Promise<JobListing[]> {
   await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
   const mockData: JobListing[] = [
     { title: 'Data Scientist', company: 'Analytics Pro', location: 'Chicago, IL', link: '#', shortDescription: 'Extracting insights from complex datasets.', source: 'Indeed' },
     { title: 'UX Designer', company: 'UserFirst Studios', location: 'Seattle, WA', link: '#', shortDescription: 'Crafting intuitive and engaging user experiences.', source: 'Indeed' },
     { title: 'Cloud Architect', company: 'InfraScale', location: 'Remote', link: '#', shortDescription: 'Designing and implementing cloud infrastructure.', source: 'Indeed' },
     { title: 'Marketing Specialist', company: 'Growth Hackers', location: 'New York, NY', link: '#', shortDescription: 'Driving customer acquisition and brand awareness.', source: 'Indeed' },
   ];
    return mockData.filter(job =>
     (job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
     (location === '' || job.location.toLowerCase().includes(location.toLowerCase()) || location.toLowerCase() === 'remote')
   );
}


export default function JobListings() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'LinkedIn' | 'Indeed'>('all');

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        // Fetch from multiple sources concurrently
        const [linkedInJobs, indeedJobs] = await Promise.all([
          fetchMockLinkedInJobs('', ''), // Initial load with no filters
          fetchMockIndeedJobs('', ''),   // Initial load with no filters
        ]);
        setJobs([...linkedInJobs, ...indeedJobs]);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        // TODO: Add user-facing error message (e.g., using toast)
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []); // Load jobs on initial mount

 const handleSearch = async () => {
    setIsLoading(true);
    try {
      let combinedJobs: JobListing[] = [];
      const sourcesToFetch: Promise<JobListing[]>[] = [];

      if (sourceFilter === 'all' || sourceFilter === 'LinkedIn') {
        sourcesToFetch.push(fetchMockLinkedInJobs(searchTerm, locationFilter));
      }
      if (sourceFilter === 'all' || sourceFilter === 'Indeed') {
         sourcesToFetch.push(fetchMockIndeedJobs(searchTerm, locationFilter));
      }

      const results = await Promise.all(sourcesToFetch);
      combinedJobs = results.flat(); // Combine results from all fetched sources
      setJobs(combinedJobs);

    } catch (error) {
      console.error("Error searching jobs:", error);
      // TODO: Add user-facing error message
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-4">
       {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 sm:w-full" // Adjusted width
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
         <div className="relative flex-grow">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Filter by location..."
             value={locationFilter}
             onChange={(e) => setLocationFilter(e.target.value)}
             className="pl-8 sm:w-full" // Adjusted width
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
           />
         </div>
         <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as 'all' | 'LinkedIn' | 'Indeed')}>
             <SelectTrigger className="w-full sm:w-[180px]">
               <SelectValue placeholder="Filter by source" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Sources</SelectItem>
               <SelectItem value="LinkedIn">LinkedIn</SelectItem>
               <SelectItem value="Indeed">Indeed</SelectItem>
             </SelectContent>
         </Select>
        <Button onClick={handleSearch} className="w-full sm:w-auto">
           <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

       {/* Job Table */}
      <Card>
        <CardContent className="p-0"> {/* Remove Card padding to allow table full width */}
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                 <TableHead>Source</TableHead>
                <TableHead className="text-right">Link</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                 Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-2/3" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-1/3" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 float-right" /></TableCell>
                    </TableRow>
                    ))
                ) : jobs.length > 0 ? (
                jobs.map((job, index) => (
                    <TableRow key={index}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell className="text-muted-foreground">{job.location}</TableCell>
                     <TableCell className="text-muted-foreground">{job.source}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                        <Link href={job.link} target="_blank" rel="noopener noreferrer">
                            View Job
                        </Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                     No jobs found matching your criteria.
                   </TableCell>
                 </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}