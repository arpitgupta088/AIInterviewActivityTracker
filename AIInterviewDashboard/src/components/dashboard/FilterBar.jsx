/**
 * FilterBar Component
 * Provides search and filtering capabilities for candidate activity events.
 */

import React from 'react';
import { Row, Col, Form, InputGroup, Card } from 'react-bootstrap';

function FilterBar({ searchTerm, setSearchTerm, selectedEvent, setSelectedEvent }) {
  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body className="p-3">
        {/* Search & Filter Controls */}
        <Row className="g-3">

          {/* Candidate Search Input */}
          <Col xs={12} md={6} lg={4}>
            <Form.Group controlId="searchCandidate">
              <Form.Control
                type="text"
                placeholder="Search by Candidate ID or Session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Event Type Filter Dropdown */}
          <Col xs={12} md={6} lg={4}>
            <Form.Select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="ALL">All Event Types</option>
              <option value="PAGE_LOAD">PAGE_LOAD</option>
              <option value="PAGE_UNLOAD">PAGE_UNLOAD</option>
              <option value="TAB_VISIBLE">TAB_VISIBLE</option>
              <option value="TAB_HIDDEN">TAB_HIDDEN</option>
              <option value="WINDOW_BLUR">WINDOW_BLUR</option>
              <option value="WINDOW_FOCUS">WINDOW_FOCUS</option>
              <option value="CAMERA_TOGGLED">CAMERA_TOGGLED</option>
              <option value="MIC_TOGGLED">MIC_TOGGLED</option>
              <option value="NETWORK_OFFLINE">NETWORK_OFFLINE</option>
              <option value="NETWORK_ONLINE">NETWORK_ONLINE</option>
            </Form.Select>
          </Col>

        </Row>
      </Card.Body>
    </Card>
  );
}

export default FilterBar;