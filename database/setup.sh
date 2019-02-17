# Variables
database="project"
user="'server'@'localhost'"

service mysql start

echo "This sctipt will drop database $database and user $user and create new ones"
echo "You will loose all information in database $database and user $user!"
read -p "Continue? (Y/N): " confirm

case $confirm in
   [yY]* ) echo "Continuing..."
           break;;
   * ) echo "Script aborted"
           exit 1;;
esac

# Drop the entire database and 'server' user
echo "Dropping database..."
mysql -e "DROP DATABASE IF EXISTS $database;"
echo "Dropping user..."
mysql -e "DROP USER IF EXISTS $user;"
# Create the new database
echo "Setting up new database..."
mysql -e "source ./setup.sql"
echo "Done."
