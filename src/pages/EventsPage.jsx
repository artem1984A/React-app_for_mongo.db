import React, { useContext, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  Center,
  Container,
  Avatar,
  Input,
  Select,
  Spinner,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { DataContext } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const EventsPage = () => {
  const { events, categories, users, setEvents } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [eventToDelete, setEventToDelete] = useState(null);
  const toast = useToast();

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilter = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredEvents = events
    .filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((event) => {
      const categoryIds = event.categoryIds || [];
      return selectedCategory ? categoryIds.includes(Number(selectedCategory)) : true;
    });

  const handleDeleteClick = (_id) => {
    setEventToDelete(_id); // Use _id for MongoDB
    onOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      await fetch(`/api/events/${eventToDelete}`, {
        method: 'DELETE',
      });
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventToDelete));
      toast({
        title: 'Event deleted.',
        description: 'The event has been deleted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error deleting the event.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
  };

  const getCategoryNames = useCallback(
    (categoryIds) => {
      return categoryIds
        .map((id) => categories.find((category) => category.id === id)?.name || 'Unknown')
        .join(', ');
    },
    [categories]
  );

  const getUserById = useCallback(
    (userId) => {
      return users.find((user) => user._id === userId); // Use _id for MongoDB
    },
    [users]
  );

  if (!events.length) return <Spinner />;

  return (
    <Container maxW="container.lg" p={4}>
      <Center>
        <Heading mb={4}>Events</Heading>
      </Center>
      <Input
        placeholder="Search events"
        value={searchTerm}
        onChange={handleSearch}
        mb={4}
      />
      <Select placeholder="All categories" value={selectedCategory} onChange={handleFilter} mb={4}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <VStack spacing={6}>
        {filteredEvents.map((event) => {
          const creator = getUserById(event.createdBy);
          return (
            <Box
              key={event._id} // Use _id for MongoDB
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              w="100%"
              boxShadow="md"
              backgroundColor="white"
              textAlign="center"
            >
              <Heading size="md" mb={2}>{event.title}</Heading>
              {event.image && (
                <Center>
                  <Image src={event.image} alt={event.title} boxSize={{ base: '100%', md: '300px' }} mb={2} />
                </Center>
              )}
              <Text mb={2}>{event.description}</Text>
              <Text mb={2}>
                {new Date(event.startTime).toLocaleString()} -{' '}
                {new Date(event.endTime).toLocaleString()}
              </Text>
              <Text mb={2}>
                Categories: {event.categoryIds?.length ? getCategoryNames(event.categoryIds) : 'Unknown'}
              </Text>
              <Text mb={2}>
                Location: {event.location || 'Location not specified'}
              </Text>
              {creator && (
                <HStack justifyContent="center" mb={4}>
                  <Avatar size="sm" src={creator.image || 'https://via.placeholder.com/150'} name={creator.name} />
                  <Text>Created By: {creator.name || 'Unknown Author'}</Text>
                </HStack>
              )}
              <HStack justifyContent="center" spacing={4}>
                <Button as={Link} to={`/home/events/edit/${event._id}`} colorScheme="blue">
                  Edit
                </Button>
                <Button colorScheme="red" onClick={() => handleDeleteClick(event._id)}>
                  Delete
                </Button>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this event?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EventsPage;