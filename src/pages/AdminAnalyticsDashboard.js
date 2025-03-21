import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  FiDownload, FiUsers, FiUserCheck, FiShield, FiFileText, 
  FiChevronDown, FiChevronUp, FiFilter, FiCalendar, FiAlertTriangle,
  FiMessageSquare, FiCheckCircle, FiThumbsUp, FiRefreshCw
} from 'react-icons/fi';
import { format, subDays, parseISO, formatDistanceToNow } from 'date-fns';
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Color palette to match your UI
const STATUS_COLORS = {
  total: '#f0b94b',      // Yellow
  new: '#4471a0',        // Blue
  open: '#2c5878',       // Dark Blue
  closed: '#4a909a',     // Teal
  urgent: '#5a8a94',     // Seafoam
  unanswered: '#f0b94b', // Yellow
  answered: '#2c5878',   // Dark Blue
  solved: '#4a909a',     // Teal
};

const PIE_COLORS = ['#4471a0', '#2c5878', '#4a909a', '#5a8a94', '#f0b94b', '#e27b4e'];

const AdminAnalyticsDashboard = () => {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTickets: 0,
    newTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    urgentTickets: 0,
    unansweredTickets: 0,
    answeredTickets: 0,
    solvedTickets: 0,
    totalUsers: 0,
    totalEmployees: 0,
    totalAdmins: 0
  });
  const [cardsCollapsed, setCardsCollapsed] = useState({
    tickets: false,
    users: false,
    employees: false,
    admins: false
  });
  const [ticketStatusData, setTicketStatusData] = useState([]);
  const [ticketTrends, setTicketTrends] = useState([]);
  const [userTrends, setUserTrends] = useState([]);
  const [employeeTrends, setEmployeeTrends] = useState([]);
  const [adminTrends, setAdminTrends] = useState([]);
  const [employeeWorkload, setEmployeeWorkload] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [employeeActivity, setEmployeeActivity] = useState([]);
  const [downloadFormat, setDownloadFormat] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [dateRange, setDateRange] = useState('last30days');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get date range based on selection
      let startDate;
      const endDate = new Date();
      
      switch(dateRange) {
        case 'last7days':
          startDate = subDays(endDate, 7);
          break;
        case 'last30days':
          startDate = subDays(endDate, 30);
          break;
        case 'last90days':
          startDate = subDays(endDate, 90);
          break;
        default:
          startDate = subDays(endDate, 30);
      }
      
      const startDateStr = startDate.toISOString();
      
      // Fetch all tickets for status analysis
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ticketsError) throw new Error(`Error fetching tickets: ${ticketsError.message}`);
      
      if (!tickets || tickets.length === 0) {
        console.warn("No tickets found in database");
        // Create sample data for development
        const sampleTickets = generateSampleData();
        setTicketStatusData(sampleTickets.statusData);
        setTicketTrends(sampleTickets.trends);
        setRecentTickets(sampleTickets.recent);
        
        setStats({
          totalTickets: 31,
          newTickets: 2,
          openTickets: 5,
          closedTickets: 18,
          urgentTickets: 6,
          unansweredTickets: 4,
          answeredTickets: 8,
          solvedTickets: 18,
          totalUsers: 25,
          totalEmployees: 3,
          totalAdmins: 2
        });
      } else {
        // Process real ticket data
        // Count tickets by status
        const now = new Date();
        const newTickets = tickets.filter(t => 
          new Date(t.created_at) >= subDays(now, 1) && t.status === 'new'
        ).length;
        
        const openTickets = tickets.filter(t => t.status === 'open').length;
        const closedTickets = tickets.filter(t => t.status === 'closed').length;
        const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;
        const unansweredTickets = tickets.filter(t => t.status === 'new' || (t.status === 'open' && !t.last_reply)).length;
        const answeredTickets = tickets.filter(t => t.last_reply && t.status !== 'closed').length;
        const solvedTickets = tickets.filter(t => t.status === 'closed' && t.resolution === 'solved').length;
        
        // Format ticket status data for pie chart
        const statusCounts = {};
        tickets.forEach(ticket => {
          const status = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const formattedTicketStatus = Object.keys(statusCounts).map(status => ({
          name: status,
          value: statusCounts[status]
        }));
        
        setTicketStatusData(formattedTicketStatus);
        
        // Process ticket trends
        const ticketsInRange = tickets.filter(t => 
          new Date(t.created_at) >= startDate
        );
        
        const ticketsByDay = processTrendData(ticketsInRange, 'created_at');
        setTicketTrends(ticketsByDay);
        
        // Set recent tickets (up to 10)
        const recent = tickets
          .slice(0, 10)
          .map(ticket => ({
            id: ticket.id,
            title: ticket.title || `Ticket #${ticket.id}`,
            updated: ticket.updated_at || ticket.created_at,
            action: ticket.last_reply ? 'Answered' : ticket.status === 'closed' ? 'Closed' : 'Open',
            status: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)
          }));
        
        setRecentTickets(recent);
        
        setStats({
          totalTickets: tickets.length,
          newTickets,
          openTickets,
          closedTickets,
          urgentTickets,
          unansweredTickets,
          answeredTickets,
          solvedTickets,
          totalUsers: 0, // Will be updated below
          totalEmployees: 0,
          totalAdmins: 0
        });
      }
      
      // Fetch users
      const [
        { data: users, error: usersError },
        { data: employees, error: employeesError },
        { data: admins, error: adminsError }
      ] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'user').eq('is_deleted', false),
        supabase.from('users').select('*').eq('role', 'employee').eq('is_deleted', false),
        supabase.from('users').select('*').eq('role', 'admin').eq('is_deleted', false)
      ]);
      
      if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);
      if (employeesError) throw new Error(`Error fetching employees: ${employeesError.message}`);
      if (adminsError) throw new Error(`Error fetching admins: ${adminsError.message}`);
      
      // Update stats with user counts
      setStats(prev => ({
        ...prev,
        totalUsers: users?.length || 0,
        totalEmployees: employees?.length || 0,
        totalAdmins: admins?.length || 0
      }));
      
      // Process user trends
      if (users && users.length > 0) {
        const usersInRange = users.filter(u => new Date(u.created_at) >= startDate);
        const usersByDay = processTrendData(usersInRange, 'created_at');
        setUserTrends(usersByDay);
      } else {
        // Sample data
        setUserTrends(generateSampleTrendData(startDate, endDate, 1));
      }
      
      // Process employee trends
      if (employees && employees.length > 0) {
        const employeesInRange = employees.filter(e => new Date(e.created_at) >= startDate);
        const employeesByDay = processTrendData(employeesInRange, 'created_at');
        setEmployeeTrends(employeesByDay);
        
        // Set employee activity
        const activity = employees.map(emp => ({
          id: emp.id,
          name: emp.name || emp.email?.split('@')[0] || `Employee ${emp.id}`,
          status: Math.random() > 0.7 ? 'Online' : 'Offline' // Simulate status
        }));
        setEmployeeActivity(activity);
      } else {
        // Sample data
        setEmployeeTrends(generateSampleTrendData(startDate, endDate, 0.5));
        setEmployeeActivity([
          { id: 1, name: 'yehid', status: 'Offline' },
          { id: 2, name: 'ambika', status: 'Offline' },
          { id: 3, name: 'payayib6', status: 'Offline' }
        ]);
      }
      
      // Process admin trends
      if (admins && admins.length > 0) {
        const adminsInRange = admins.filter(a => new Date(a.created_at) >= startDate);
        const adminsByDay = processTrendData(adminsInRange, 'created_at');
        setAdminTrends(adminsByDay);
      } else {
        // Sample data
        setAdminTrends(generateSampleTrendData(startDate, endDate, 0.3));
      }
      
      // Fetch employee workload
      if (employees && employees.length > 0) {
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select('user_id, ticket_id, assigned_at')
          .gte('assigned_at', startDateStr)
          .order('assigned_at');
        
        if (assignmentsError) {
          console.error("Error fetching assignments:", assignmentsError);
          // Simulate workload data
          const workloadByEmployee = employees.map(employee => ({
            id: employee.id,
            name: employee.name || employee.email?.split('@')[0] || `Employee ${employee.id}`,
            assignedTickets: Math.floor(Math.random() * 10) + 1 // Random 1-10
          })).sort((a, b) => b.assignedTickets - a.assignedTickets);
          
          setEmployeeWorkload(workloadByEmployee);
        } else if (assignments) {
          // Process employee workload data
          const workloadByEmployee = employees.map(employee => {
            const employeeAssignments = assignments.filter(a => a.user_id === employee.id);
            return {
              id: employee.id,
              name: employee.name || employee.email?.split('@')[0] || `Employee ${employee.id}`,
              assignedTickets: employeeAssignments.length
            };
          }).sort((a, b) => b.assignedTickets - a.assignedTickets);
          
          setEmployeeWorkload(workloadByEmployee);
        }
      } else {
        // Sample workload data
        setEmployeeWorkload([
          { id: 1, name: 'yehid', assignedTickets: 8 },
          { id: 2, name: 'ambika', assignedTickets: 7 },
          { id: 3, name: 'payayib6', assignedTickets: 5 }
        ]);
      }
      
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.message);
      
      // Fallback to sample data in case of error
      console.log("Using sample data due to error");
      const sampleData = generateSampleData();
      setTicketStatusData(sampleData.statusData);
      setTicketTrends(sampleData.trends);
      setRecentTickets(sampleData.recent);
      setEmployeeWorkload(sampleData.workload);
      setEmployeeActivity(sampleData.activity);
      
      setStats({
        totalTickets: 31,
        newTickets: 2,
        openTickets: 5,
        closedTickets: 18,
        urgentTickets: 6,
        unansweredTickets: 4,
        answeredTickets: 8,
        solvedTickets: 18,
        totalUsers: 25,
        totalEmployees: 3,
        totalAdmins: 2
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);
  
  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time subscription for tickets
    const ticketsSubscription = supabase
      .channel('public:tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        console.log('Tickets table changed, refreshing data...');
        fetchAnalyticsData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(ticketsSubscription);
    };
  }, [fetchAnalyticsData]);
  
  // Generate sample data for development or when database is empty
  const generateSampleData = () => {
    const statusData = [
      { name: 'Open', value: 5 },
      { name: 'Closed', value: 18 },
      { name: 'New', value: 2 },
      { name: 'In Progress', value: 6 }
    ];
    
    const now = new Date();
    const trends = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(now, 29 - i), 'yyyy-MM-dd');
      return {
        date,
        count: Math.floor(Math.random() * 5) + 1,
        displayDate: format(parseISO(date), 'MMM dd')
      };
    });
    
    const recent = [
      { id: 1, title: 'rate', updated: '3/20/2025, 6:35:23 PM', action: 'Answered', status: 'Closed' },
      { id: 2, title: 'bnmkyfdd', updated: '3/20/2025, 6:18:23 PM', action: 'Open', status: 'Opened' },
      { id: 3, title: 'srf', updated: '3/20/2025, 1:26:02 PM', action: 'Closed', status: 'Closed' },
      { id: 4, title: 'sed', updated: '3/20/2025, 1:17:57 PM', action: 'Closed', status: 'Closed' }
    ];
    
    const workload = [
      { id: 1, name: 'yehid', assignedTickets: 8 },
      { id: 2, name: 'ambika', assignedTickets: 7 },
      { id: 3, name: 'payayib6', assignedTickets: 5 }
    ];
    
    const activity = [
      { id: 1, name: 'yehid', status: 'Offline' },
      { id: 2, name: 'ambika', status: 'Offline' },
      { id: 3, name: 'payayib6', status: 'Offline' }
    ];
    
    return { statusData, trends, recent, workload, activity };
  };
  
  // Generate sample trend data for development
  const generateSampleTrendData = (startDate, endDate, factor = 1) => {
    const result = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      result.push({
        date: dateStr,
        count: Math.floor(Math.random() * 3 * factor) + (Math.random() > 0.7 ? 1 : 0),
        displayDate: format(currentDate, 'MMM dd')
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  };
  
  // Process time series data function
  const processTrendData = (data, dateField) => {
    if (!data || data.length === 0) {
      return generateSampleTrendData(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    }
    
    // Create a map of dates to counts
    const countsByDay = {};
    
    data.forEach(item => {
      if (!item[dateField]) return;
      
      try {
        const date = format(new Date(item[dateField]), 'yyyy-MM-dd');
        countsByDay[date] = (countsByDay[date] || 0) + 1;
      } catch (e) {
        console.error(`Invalid date format for ${dateField}:`, item[dateField]);
      }
    });
    
    // Create a complete date range (fill gaps with zeros)
    const result = [];
    const startDate = new Date(dateRange === 'last7days' ? Date.now() - 7 * 24 * 60 * 60 * 1000 : 
                             dateRange === 'last30days' ? Date.now() - 30 * 24 * 60 * 60 * 1000 :
                             Date.now() - 90 * 24 * 60 * 60 * 1000);
    let currentDate = new Date(startDate);
    const today = new Date();
    
    while (currentDate <= today) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      result.push({
        date: dateStr,
        count: countsByDay[dateStr] || 0,
        displayDate: format(currentDate, 'MMM dd')
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  };
  
  // Toggle card collapse state
  const toggleCardCollapse = (card) => {
    setCardsCollapsed(prev => ({
      ...prev,
      [card]: !prev[card]
    }));
  };
  
  // Handle download format selection
  const handleDownloadSelect = (format) => {
    setDownloadFormat(format);
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      if (format === 'pdf') {
        generatePDF();
      } else if (format === 'json') {
        downloadJSON();
      }
      setIsGeneratingReport(false);
      setShowDownloadOptions(false);
    }, 100);
  };
  
  // Generate PDF report with improved implementation
  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and header
      doc.setFillColor(38, 78, 112); // Dark blue header
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Support System Analytics Report', 15, 12);
      
      // Reset text color for body
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} for ${dateRange.replace('last', 'Last ').replace('days', ' Days')}`, 15, 25);
      
      // Add summary stats
      doc.setFontSize(14);
      doc.text('Summary Statistics', 15, 35);
      
      const tableData = [
        ['Metric', 'Count'],
        ['Total Tickets', stats.totalTickets.toString()],
        ['New Tickets', stats.newTickets.toString()],
        ['Open Tickets', stats.openTickets.toString()],
        ['Closed Tickets', stats.closedTickets.toString()],
        ['Urgent Tickets', stats.urgentTickets.toString()],
        ['Users', stats.totalUsers.toString()],
        ['Employees', stats.totalEmployees.toString()],
        ['Admins', stats.totalAdmins.toString()]
      ];
      
      doc.autoTable({
        startY: 38,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 38 }
      });
      
      // Add ticket status breakdown
      doc.text('Ticket Status Breakdown', 15, doc.autoTable.previous.finalY + 10);
      
      // Ensure we have status data
      const statusData = ticketStatusData.length > 0 ? ticketStatusData : [
        { name: 'Open', value: stats.openTickets },
        { name: 'Closed', value: stats.closedTickets },
        { name: 'New', value: stats.newTickets }
      ];
      
      const statusTableData = [
        ['Status', 'Count', 'Percentage'],
        ...statusData.map(item => [
          item.name, 
          item.value.toString(), 
          `${((item.value / (stats.totalTickets || 1)) * 100).toFixed(1)}%`
        ])
      ];
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 13,
        head: [statusTableData[0]],
        body: statusTableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add employee workload table
      doc.text('Employee Workload', 15, doc.autoTable.previous.finalY + 10);
      
      const workloadData = [
        ['Employee Name', 'Assigned Tickets'],
        ...employeeWorkload.map(item => [
          item.name, 
          item.assignedTickets.toString()
        ])
      ];
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 13,
        head: [workloadData[0]],
        body: workloadData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add recent tickets
      doc.text('Recent Tickets', 15, doc.autoTable.previous.finalY + 10);
      
      const ticketData = [
        ['ID', 'Title', 'Updated', 'Status'],
        ...recentTickets.map(ticket => [
          ticket.id.toString(),
          ticket.title,
          typeof ticket.updated === 'string' ? ticket.updated : format(new Date(ticket.updated), 'yyyy-MM-dd HH:mm'),
          ticket.status
        ])
      ];
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 13,
        head: [ticketData[0]],
        body: ticketData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add employee activity
      doc.text('Employee Activity Status', 15, doc.autoTable.previous.finalY + 10);
      
      const activityData = [
        ['Employee', 'Status'],
        ...employeeActivity.map(emp => [
          emp.name,
          emp.status
        ])
      ];
      
      doc.autoTable({
        startY: doc.autoTable.previous.finalY + 13,
        head: [activityData[0]],
        body: activityData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Add ticket trend data
      if (doc.autoTable.previous.finalY > 240) {
        doc.addPage();
        
        // Add header to new page
        doc.setFillColor(38, 78, 112);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('Support System Analytics - Trends', 15, 12);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Ticket Trends', 15, 30);
      } else {
        doc.text('Ticket Trends', 15, doc.autoTable.previous.finalY + 10);
      }
      
      const trendData = [
        ['Date', 'Ticket Count'],
        ...ticketTrends.map(trend => [
          trend.displayDate,
          trend.count.toString()
        ])
      ];
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 13,
        head: [trendData[0]],
        body: trendData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        maxRows: 15 // Limit rows to prevent oversized table
      });
      
      doc.save(`support-analytics-report-${dateRange}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };
  
  // Prepare CSV data
  const prepareCSVData = () => {
    // Basic summary data
    const summaryData = [
      ['Support System Analytics Report'],
      ['Generated on', new Date().toLocaleDateString()],
      ['Date Range', dateRange.replace('last', 'Last ').replace('days', ' Days')],
      [''],
      ['Summary Statistics'],
      ['Metric', 'Count'],
      ['Total Tickets', stats.totalTickets],
      ['New Tickets', stats.newTickets],
      ['Open Tickets', stats.openTickets],
      ['Closed Tickets', stats.closedTickets],
      ['Urgent Tickets', stats.urgentTickets],
      ['Unanswered Tickets', stats.unansweredTickets],
      ['Answered Tickets', stats.answeredTickets],
      ['Solved Tickets', stats.solvedTickets],
      ['Total Users', stats.totalUsers],
      ['Total Employees', stats.totalEmployees],
      ['Total Admins', stats.totalAdmins],
      [''],
      ['Ticket Status Breakdown'],
      ['Status', 'Count', 'Percentage'],
      ...ticketStatusData.map(item => [
        item.name, 
        item.value, 
        `${((item.value / (stats.totalTickets || 1)) * 100).toFixed(1)}%`
      ]),
      [''],
      ['Employee Workload'],
      ['Employee Name', 'Assigned Tickets'],
      ...employeeWorkload.map(item => [
        item.name, 
        item.assignedTickets
      ]),
      [''],
      ['Recent Tickets'],
      ['ID', 'Title', 'Updated', 'Action', 'Status'],
      ...recentTickets.map(ticket => [
        ticket.id,
        ticket.title,
        ticket.updated,
        ticket.action,
        ticket.status    
        ]),
        [''],
        ['Ticket Trends'],
        ['Date', 'Ticket Count'],
        ...ticketTrends.map(trend => [
          trend.displayDate,
          trend.count
        ]),
        [''],
        ['Employee Activity Status'],
        ['Employee', 'Status'],
        ...employeeActivity.map(emp => [
          emp.name,
          emp.status
        ])
      ];
      
      return summaryData;
    };
    
    // JSON download function
    const downloadJSON = () => {
      try {
        // Prepare comprehensive JSON data
        const jsonData = {
          reportInfo: {
            title: "Support System Analytics Report",
            generatedOn: new Date().toISOString(),
            dateRange,
          },
          summary: {
            tickets: {
              total: stats.totalTickets,
              new: stats.newTickets,
              open: stats.openTickets,
              closed: stats.closedTickets,
              urgent: stats.urgentTickets,
              unanswered: stats.unansweredTickets,
              answered: stats.answeredTickets,
              solved: stats.solvedTickets
            },
            users: {
              total: stats.totalUsers,
              employees: stats.totalEmployees,
              admins: stats.totalAdmins
            }
          },
          ticketStatusData,
          ticketTrends,
          userTrends,
          employeeTrends,
          adminTrends,
          employeeWorkload,
          recentTickets,
          employeeActivity
        };
        
        // Convert to JSON string and create blob
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `support-analytics-${dateRange}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error generating JSON:", error);
        alert("There was an error generating the JSON file. Please try again.");
      }
    };
    
    // Handle date range change
    const handleDateRangeChange = (range) => {
      setDateRange(range);
    };
    
    // Handle refresh button click
    const handleRefresh = () => {
      fetchAnalyticsData();
    };
    
    // CSS classes for cards
    const cardClass = "bg-white rounded-lg shadow-md p-4 mb-4";
    const cardHeaderClass = "flex justify-between items-center mb-4";
    const cardTitleClass = "text-lg font-semibold text-blue-800";
    const iconButtonClass = "text-gray-500 hover:text-gray-700 transition-colors";
    const statValueClass = "text-2xl font-bold";
    const statLabelClass = "text-sm text-gray-500";
    const cardContentClass = "mt-2";
    
    // Get total of all employees
    const totalAssignedTickets = employeeWorkload.reduce((sum, emp) => sum + emp.assignedTickets, 0);
    
    if (loading) {
      return (
        <div className="p-8 flex items-center justify-center h-screen">
          <div className="text-center">
            <FiRefreshCw className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Loading analytics data...</h2>
            <p className="text-gray-500 mt-2">Please wait while we fetch the latest information.</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <div className="flex items-center">
              <FiAlertTriangle className="text-red-500 mr-2 text-xl" />
              <span className="block sm:inline font-medium">Error loading analytics data</span>
            </div>
            <p className="mt-2">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded inline-flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen z-10">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Support Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive view of your support system performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row mt-4 md:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 z-1">
            {/* Date Range Filter */}
            <div className="">
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-1"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
              {/* <FiCalendar className="relative left-10 right-40 text-gray-400 pointer-events-none" /> */}
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="bg-white border border-gray-300 rounded-md py-2 px-4 text-sm flex items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-1"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
            
            {/* Download Report Button */}
            <div className="">
              <button 
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className="bg-blue-600 text-white rounded-md py-2 px-4 text-sm flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiDownload className="mr-2" />
                Download Report
                {showDownloadOptions ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
              </button>
              
              {showDownloadOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-[-10] border border-gray-200">
                  {isGeneratingReport ? (
                    <div className="px-4 py-3 text-sm text-gray-600 flex items-center">
                      <FiRefreshCw className="animate-spin mr-2" />
                      Generating report...
                    </div>
                  ) : (
                    <>
                      <CSVLink 
                        data={prepareCSVData()} 
                        filename={`support-analytics-${dateRange}.csv`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Export as CSV
                      </CSVLink>
                      <button 
                        onClick={() => handleDownloadSelect('pdf')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Export as PDF
                      </button>
                      <button 
                        onClick={() => handleDownloadSelect('json')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Export as JSON
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Ticket Stats */}
          <div className={cardClass + " lg:col-span-4"}>
            <div className={cardHeaderClass}>
              <h2 className={cardTitleClass}>
                <FiFileText className="inline-block mr-2" />
                Ticket Statistics
              </h2>
              <button 
                className={iconButtonClass} 
                onClick={() => toggleCardCollapse('tickets')}
                aria-label="Toggle ticket statistics"
              >
                {cardsCollapsed.tickets ? <FiChevronDown /> : <FiChevronUp />}
              </button>
            </div>
            
            {!cardsCollapsed.tickets && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Tickets */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className={statLabelClass}>Total Tickets</div>
                  <div className={statValueClass + " text-blue-700"}>{stats.totalTickets}</div>
                </div>
                
                {/* New Tickets */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className={statLabelClass}>New Tickets</div>
                  <div className={statValueClass + " text-blue-600"}>{stats.newTickets}</div>
                </div>
                
                {/* Open Tickets */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <div className={statLabelClass}>Open Tickets</div>
                  <div className={statValueClass + " text-yellow-700"}>{stats.openTickets}</div>
                </div>
                
                {/* Closed Tickets */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className={statLabelClass}>Closed Tickets</div>
                  <div className={statValueClass + " text-green-700"}>{stats.closedTickets}</div>
                </div>
                
                {/* Urgent Tickets */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className={statLabelClass}>Urgent Tickets</div>
                  <div className={statValueClass + " text-red-600"}>{stats.urgentTickets}</div>
                </div>
                
                {/* Unanswered Tickets */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div className={statLabelClass}>Unanswered</div>
                  <div className={statValueClass + " text-orange-600"}>{stats.unansweredTickets}</div>
                </div>
                
                {/* Answered Tickets */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className={statLabelClass}>Answered</div>
                  <div className={statValueClass + " text-indigo-600"}>{stats.answeredTickets}</div>
                </div>
                
                {/* Solved Tickets */}
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <div className={statLabelClass}>Solved</div>
                  <div className={statValueClass + " text-teal-600"}>{stats.solvedTickets}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* User Stats */}
          <div className={cardClass + " lg:col-span-3"}>
            <div className={cardHeaderClass}>
              <h2 className={cardTitleClass}>
                <FiUsers className="inline-block mr-2" />
                User Statistics
              </h2>
              <button 
                className={iconButtonClass} 
                onClick={() => toggleCardCollapse('users')}
                aria-label="Toggle user statistics"
              >
                {cardsCollapsed.users ? <FiChevronDown /> : <FiChevronUp />}
              </button>
            </div>
            
            {!cardsCollapsed.users && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Total Users */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className={statLabelClass}>Total Users</div>
                    <div className={statValueClass + " text-purple-600"}>{stats.totalUsers}</div>
                  </div>
                  
                  {/* Total Employees */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className={statLabelClass}>Employees</div>
                    <div className={statValueClass + " text-blue-600"}>{stats.totalEmployees}</div>
                  </div>
                  
                  {/* Total Admins */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className={statLabelClass}>Admins</div>
                    <div className={statValueClass + " text-gray-600"}>{stats.totalAdmins}</div>
                  </div>
                </div>
                
                {/* User Trends Chart */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">User Registration Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userTrends} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(value) => value}
                        />
                        <YAxis 
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} new users`, 'Registrations']}
                          labelFormatter={(value) => `Date: ${value}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          name="New Users" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Ticket Status Pie Chart */}
          <div className={cardClass + " lg:col-span-1"}>
            <div className={cardHeaderClass}>
              <h2 className={cardTitleClass}>Ticket Status</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ticketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Ticket Trends Chart */}
          <div className={cardClass + " lg:col-span-2"}>
            <div className={cardHeaderClass}>
              <h2 className={cardTitleClass}>Ticket Trends</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketTrends} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} tickets`, 'Created']}
                    labelFormatter={(value) => `Date: ${value}`}
                  />
                  <Legend verticalAlign="top" align="right" />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="New Tickets" 
                    stroke={STATUS_COLORS.new} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Employee Workload Chart */}
          <div className={cardClass + " lg:col-span-2"}>
            <div className={cardHeaderClass}>
              <h2 className={cardTitleClass}>Employee Workload</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={employeeWorkload}
                  layout="vertical" 
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 'dataMax + 2']} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} tickets`, 'Assigned']}
                    labelFormatter={(value) => `Employee: ${value}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="assignedTickets" 
                    fill={STATUS_COLORS.open}
                    name="Assigned Tickets"
                    label={{ 
                      position: 'right', 
                      formatter: (value) => value > 0 ? value : '',
                      fill: '#666'
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Tickets */}
          <div className={cardClass + " lg:col-span-7"}>
            <div className={cardHeaderClass}>
              <h2 className={cardTitleClass}>Recent Tickets</h2>
            </div>
            <div className={cardContentClass + " overflow-x-auto"}>
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs leading-4 text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm leading-5 text-gray-700">
                  {recentTickets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No recent tickets to display
                      </td>
                    </tr>
                  ) : (
                    recentTickets.map((ticket, index) => (
                      <tr key={ticket.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 whitespace-nowrap">#{ticket.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium overflow-hidden overflow-ellipsis" 
                            style={{ maxWidth: '200px', textOverflow: 'ellipsis' }}>
                          {ticket.title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {typeof ticket.updated === 'string' 
                            ? ticket.updated 
                            : formatDistanceToNow(new Date(ticket.updated), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {ticket.action === 'Answered' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              <FiMessageSquare className="mr-1" /> Answered
                            </span>
                          )}
                          {ticket.action === 'Closed' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FiCheckCircle className="mr-1" /> Closed
                            </span>
                          )}
                          {ticket.action === 'Open' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <FiThumbsUp className="mr-1" /> Open
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'Closed' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'New' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default AdminAnalyticsDashboard;