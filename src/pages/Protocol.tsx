
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { protocolMessages } from '@/data/protocol-messages';
import { Hold, Secure, Lockdown, Evacuate, Shelter } from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'hold':
      return <Hold className="h-6 w-6 text-amber-500" />;
    case 'secure':
      return <Secure className="h-6 w-6 text-blue-500" />;
    case 'lockdown':
      return <Lockdown className="h-6 w-6 text-red-600" />;
    case 'evacuate':
      return <Evacuate className="h-6 w-6 text-orange-500" />;
    case 'shelter':
      return <Shelter className="h-6 w-6 text-purple-600" />;
    default:
      return null;
  }
};

const Protocol = () => {
  // Sample configuration values
  const config = {
    evacuationLocation: 'Main Parking Lot',
    shelterHazard: 'Tornado',
  };

  const formatMessage = (message: string): string => {
    // Replace placeholders with actual values
    return message
      .replace('{location}', config.evacuationLocation)
      .replace('{hazard}', config.shelterHazard);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Standard Response Protocol</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Public Address Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Action</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocolMessages.map((protocol) => (
                <TableRow key={protocol.type}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getIcon(protocol.type || '')}
                      <span className="uppercase">{protocol.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatMessage(protocol.message)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Release Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Action</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocolMessages.map((protocol) => (
                <TableRow key={`release-${protocol.type}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getIcon(protocol.type || '')}
                      <span className="uppercase">{protocol.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{protocol.releaseMessage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Hold Procedure",
            icon: <Hold className="h-12 w-12 text-amber-500 mb-4" />,
            description: "Use when there is an issue in hallways or common areas that requires students and staff to stay in their classrooms or designated areas.",
            steps: [
              "Clear the halls and return to your room",
              "Continue with normal activities inside your room",
              "Stay in place until the 'All Clear' announcement is made"
            ]
          },
          {
            title: "Secure Procedure",
            icon: <Secure className="h-12 w-12 text-blue-500 mb-4" />,
            description: "Used when there is a threat or hazard outside of the school building.",
            steps: [
              "Get inside the building",
              "Lock all exterior doors",
              "Continue with normal activities inside the building",
              "Increased situational awareness"
            ]
          },
          {
            title: "Lockdown Procedure",
            icon: <Lockdown className="h-12 w-12 text-red-600 mb-4" />,
            description: "Used when there is a threat or hazard inside the school building.",
            steps: [
              "Lock classroom doors",
              "Turn off lights",
              "Move away from sight (stay out of view from doors and windows)",
              "Maintain silence",
              "Do not open the door for anyone"
            ]
          },
          {
            title: "Evacuate Procedure",
            icon: <Evacuate className="h-12 w-12 text-orange-500 mb-4" />,
            description: "Used when there is a need to move students and staff from one location to another.",
            steps: [
              "Leave all items behind",
              "Form a single-file line",
              "Take the evacuation route to designated location",
              "Be prepared for alternatives if normal route is dangerous"
            ]
          },
          {
            title: "Shelter Procedure",
            icon: <Shelter className="h-12 w-12 text-purple-600 mb-4" />,
            description: "Used when specific protective actions are needed based on a threat or hazard.",
            steps: [
              "Use appropriate shelter strategy for the situation",
              "For tornado: move to interior rooms or hallways, away from windows",
              "For hazmat: seal room, turn off HVAC systems",
              "For earthquake: drop, cover, and hold on"
            ]
          }
        ].map((procedure, index) => (
          <Card key={index} className="flex flex-col items-center text-center p-6">
            {procedure.icon}
            <CardTitle className="mb-2">{procedure.title}</CardTitle>
            <p className="text-sm text-muted-foreground mb-4">{procedure.description}</p>
            <ul className="text-left w-full space-y-2">
              {procedure.steps.map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 text-primary font-bold">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Protocol;
