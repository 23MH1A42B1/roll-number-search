import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle, GraduationCap, Eye, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FIELD_LABELS: Record<string, string> = {
  rollno: 'Roll Number',
  studentname: 'Student Name',
  joinedbatch: 'Joined Batch',
  acadamicbatch: 'Academic Batch',
  studentstatus: 'Status',
  coursename: 'Course',
  branch: 'Branch',
  semestername: 'Current Semester',
  fathername: 'Father Name',
  dateofbirth: 'Date of Birth',
  joindate: 'Join Date',
  category: 'Category',
  castename: 'Caste',
  semesteratjoin: 'Semester at Join',
  semesteratrelieved: 'Semester at Relieve',
  joinedyear: 'Joined Year',
  relievedyear: 'Passing Year',
  mobilenumber: 'Mobile Number',
  emailid: 'Email',
  padoorno: 'Door No',
  pastreet: 'Street',
  village: 'Village',
  mandal: 'Mandal',
  district: 'District',
  statename: 'State',
  country: 'Country',
  gender: 'Gender',
  bloodgroup: 'Blood Group',
  nationality: 'Nationality',
  religion: 'Religion',
  mothertongue: 'Mother Tongue',
  eamcethallticketnumber: 'EAMCET Hall Ticket',
  eamcetrank: 'EAMCET Rank',
  scholarship: 'Scholarship',
  entrancetype: 'Entrance Type',
  seattype: 'Seat Type',
  fatheroccupation: 'Father Occupation',
  fathermobilenumber: 'Father Mobile',
  fatheremailid: 'Father Email',
  motheroccupation: 'Mother Occupation',
  mothermobilenumber: 'Mother Mobile',
  motheremailid: 'Mother Email',
  sschtno: 'SSC Hall Ticket',
  sscboard: 'SSC Board',
  sscyearofpass: 'SSC Year of Pass',
  sscmaxmarks: 'SSC Max Marks',
  sscobtained: 'SSC Marks Obtained',
  sscinstitution: 'SSC School',
  sscgradepoints: 'SSC Grade Points',
  interhtno: 'Inter Hall Ticket',
  interboard: 'Inter Board',
  interyearofpass: 'Inter Year of Pass',
  intermaxmarks: 'Inter Max Marks',
  interobtained: 'Inter Marks Obtained',
  interinstitution: 'Inter College',
  intergradepoints: 'Inter Grade Points',
  diplomahtno: 'Diploma Hall Ticket',
  diplomaboard: 'Diploma Board',
  diplomayearofpass: 'Diploma Year of Pass',
  diplomamaxmarks: 'Diploma Max Marks',
  diplomaobtained: 'Diploma Marks Obtained',
  diplomainstitution: 'Diploma Institution',
  degreehtno: 'Degree Hall Ticket',
  degreeboard: 'Degree Board',
  degreeyearofpass: 'Degree Year of Pass',
  degreemaxmarks: 'Degree Max Marks',
  degreeobtained: 'Degree Marks Obtained',
  degreeinstitution: 'Degree Institution',
  dueamount: 'Due Amount',
  previousdue: 'Previous Due',
  heldclasses: 'Classes Held',
  attenedclasses: 'Classes Attended',
  backlogs: 'Backlogs',
  overallpercent: 'Attendance %',
};

const StudentPhotoFinder = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [foundCampus, setFoundCampus] = useState<'AEC' | 'ACET' | null>(null);
  const [foundRollNumber, setFoundRollNumber] = useState('');
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [visitCount, setVisitCount] = useState<number>(0);
  const { toast } = useToast();

  // Increment visit count on page load
  useEffect(() => {
    const incrementVisitCount = async () => {
      const { data, error } = await supabase.rpc('increment_visit_count');
      if (!error && data) {
        setVisitCount(data);
      } else {
        // Fallback: fetch current count if increment fails
        const { data: countData } = await supabase
          .from('site_visits')
          .select('visit_count')
          .limit(1)
          .maybeSingle();
        if (countData) {
          setVisitCount(countData.visit_count);
        }
      }
    };
    
    incrementVisitCount();
  }, []);

  // Disable right-click context menu and inspection shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === 'f12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.ctrlKey && ['u', 's'].includes(key))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = async () => {
    const trimmed = rollNumber.trim();
    if (!trimmed) {
      toast({
        title: "Error",
        description: "Please enter a roll number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setImageError(false);
    setImageUrl('');
    setFoundCampus(null);
    setFoundRollNumber('');
    setDetails(null);

    const { data, error } = await supabase.functions.invoke('student-photo', {
      body: { rollNumber: trimmed },
    });

    setIsLoading(false);

    if (!error && data?.success) {
      setImageUrl(data.image ?? '');
      setFoundCampus(data.campus ?? null);
      setFoundRollNumber(data.rollNumber ?? '');
      setDetails(data.details ?? null);
      if (!data.image && !data.details) setImageError(true);
      return;
    }

    setImageUrl('');
    setImageError(true);
    toast({
      title: "Not found",
      description: "No student found for this roll number.",
      variant: "destructive"
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRollNumber(e.target.value);
    // Clear results when user starts typing a new roll number
    if (imageUrl || details) {
      setImageUrl('');
      setImageError(false);
      setFoundRollNumber('');
      setDetails(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Image Search
          </h1>
          <p className="text-muted-foreground">
            Search student images by roll number
          </p>
        </div>

        {/* Search Card */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-primary flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" />
              Search Student Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="rollNumber" className="text-sm font-medium text-foreground">
                Roll Number
              </label>
              <div className="relative">
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="Enter roll number"
                  value={rollNumber}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg border-2 focus:border-primary transition-colors"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !rollNumber.trim()}
              className="w-full h-12 text-lg font-semibold bg-primary hover:bg-education-dark transition-all duration-300 shadow-medium"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Get Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Image Display */}
        {(imageUrl || details || imageError) && (
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              {!imageError ? (
                <div className="text-center">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`Student photo for ${rollNumber}`}
                      className="max-w-full max-h-80 mx-auto rounded-lg border-4 border-primary/20 shadow-medium"
                      style={{ maxWidth: '300px' }}
                    />
                  )}
                  {!isLoading && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Photo for roll number: <span className="font-semibold text-primary">{foundRollNumber || rollNumber}</span>
                      </p>
                      {foundCampus && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Found on {foundCampus} campus
                        </Badge>
                      )}
                      {foundRollNumber && foundRollNumber !== rollNumber.trim().toLowerCase() && (
                        <p className="text-xs text-muted-foreground">
                          (Searched: {rollNumber}, Found: {foundRollNumber})
                        </p>
                      )}
                    </div>
                  )}

                  {details && (
                    <div className="mt-6 text-left">
                      <h3 className="text-lg font-semibold text-foreground mb-3 text-center">
                        {details.studentname}
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(details)
                          .filter(
                            ([key, v]) =>
                              key !== 'semesterresult' &&
                              v !== null &&
                              v !== undefined &&
                              v !== '' &&
                              v !== '-',
                          )
                          .map(([key, value]) => (
                            <div key={key} className="rounded-md bg-muted/50 px-3 py-2">
                              <dt className="text-xs text-muted-foreground">
                                {FIELD_LABELS[key] ?? key}
                              </dt>
                              <dd className="text-sm font-medium text-foreground break-words">
                                {String(value)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                      {details.semesterresult && (
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground mb-2">Semester Results</p>
                          <div className="flex flex-wrap gap-2">
                            {String(details.semesterresult)
                              .split(',')
                              .map((s: string) => (
                                <Badge key={s} variant="secondary" className="bg-primary/10 text-primary">
                                  {s.replace(':', ': ')}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Image not found
                  </h3>
                  <p className="text-muted-foreground">
                    Image not found on both campuses with any year variation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <Card className="inline-block bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Total Visits:</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                  {visitCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentPhotoFinder;
